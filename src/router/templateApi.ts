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

// TODO: validation を定義
// TODO: validate をリネーム
// TODO: router を登録
// TODO: xxx を リネーム
// TODO: Xxx を リネーム
// TODO: SQL を修正
// TODO: リクエストパラメータを修正
export default router(
  get(
    '/api/xxx/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      const { data: xxx, error } = await client
        .from('xxx')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('id', id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...xxx[0] };
    }),
  ),
  post(
    '/api/xxx',
    jwtAuth(async (req, res) => {
      try {
        const xxx = await json(req);
        const valid = validate(xxx);
        if (!valid) {
          const message = validate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('xxx').insert([{ ...xxx }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedXxx = data;

        return { ...insertedXxx };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  put(
    '/api/xxx/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;

      const message: Array<string> = [];
      if (!id) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentAccount],
        error: getError,
      } = await client
        .from('account')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentAccount) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const xxx = await json(req);
      const valid = validate(xxx);
      if (!valid) {
        message.push(...validate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      const { data, error } = await client.from('xxx').update(xxx).eq('id', id);
      console.info(data, error);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const updatedXxx = data[0];
      delete updatedXxx.user_id;

      return { ...updatedXxx, id: updatedXxx.id.toString() };
    }),
  ),
  del(
    '/api/xxx/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;
      if (!id) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentAccount],
        error: getError,
      } = await client
        .from('xxx')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentAccount) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const { data, error } = await client.from('xxx').delete().eq('id', id);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const deletedXxx = data[0];
      return { ...deletedXxx };
    }),
  ),
);
