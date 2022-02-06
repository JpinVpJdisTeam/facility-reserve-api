import { json, send } from 'micro';
import { sign } from 'jsonwebtoken';
import { client } from '../libs/db/client';
import { get, post, del, router, put } from 'microrouter';
import { internalServerError } from '../error';
import { jwtAuth } from '../utils';
import { validate } from '../utils/validation';
import dotenv from 'dotenv';
dotenv.config();

const INVALID_ID = 'IDが不正です';

export default router(
  get(
    '/api/account/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      const { data: account, error } = await client
        .from('account')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('employee_id', id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...account[0] };
    }),
  ),
  get(
    '/api/account',
    jwtAuth(async (req) => {
      const { data: account, error } = await client.from('account').select('*');
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...account };
    }),
  ),
  post(
    '/api/account',
    jwtAuth(async (req, res) => {
      try {
        const account = await json(req);
        const valid = validate(account);
        if (!valid) {
          const message = validate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('account').insert([{ ...account }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedAccount = data;

        return { ...insertedAccount };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  put(
    '/api/account/:id',
    jwtAuth(async (req, res) => {
      const { id: employeeId } = req.params;

      const message: Array<string> = [];
      if (!employeeId) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentAccount],
        error: getError,
      } = await client
        .from('account')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('employee_id', employeeId);

      if (getError) {
        throw internalServerError();
      }

      console.log('test');

      if (!currentAccount) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const account = await json(req);
      const valid = validate(account);
      if (!valid) {
        message.push(...validate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      const { data, error } = await client.from('account').update(account).eq('employee_id', employeeId);
      console.info(data, error);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const updatedAccount = data[0];
      delete updatedAccount.user_id;

      return { ...updatedAccount, id: updatedAccount.id.toString() };
    }),
  ),
  del(
    '/api/account/:id',
    jwtAuth(async (req, res) => {
      const { id: employeeId } = req.params;
      if (!employeeId) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentAccount],
        error: getError,
      } = await client
        .from('account')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('employee_id', employeeId);

      if (getError) {
        throw internalServerError();
      }

      if (!currentAccount) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const { data, error } = await client.from('account').delete().eq('employee_id', employeeId);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const deletedAccount = data[0];
      return { ...deletedAccount };
    }),
  ),
);
