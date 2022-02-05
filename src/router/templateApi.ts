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

// TODO: router を登録
export default router(
  // TODO: xxxをAPI名に入れ替え
  get(
    '/api/xxx/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      // TODO 取得カラムを設定
      const { data: xxx, error } = await client
        .from('xxx')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('employee_id', id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...xxx[0] };
    }),
  ),
  // TODO: xxxをAPI名に入れ替え
  post(
    '/api/xxx',
    jwtAuth(async (req, res) => {
      try {
        const xxx = await json(req);
        const valid = validate(xxx);
        if (!valid) {
          // TODO valication を実装
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
  // TODO: xxxをAPI名に入れ替え
  put(
    '/api/xxx/:id',
    jwtAuth(async (req, res) => {
      // TODO id を設定
      const { id: employeeId } = req.params;

      const message: Array<string> = [];
      if (!employeeId) {
        message.push(INVALID_ID);
      }

      // TODO 検索対象を設定
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

      // TODO valication を設定
      const xxx = await json(req);
      const valid = validate(xxx);
      if (!valid) {
        message.push(...validate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      // TODO テーブル名を設定
      // TODO update 対象を設定
      // TODO id を設定
      const { data, error } = await client.from('xxx').update(xxx).eq('employee_id', employeeId);
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
      const { id: employeeId } = req.params;
      if (!employeeId) {
        return { message: [INVALID_ID] };
      }

      // TODO 検索対象を設定
      // TODO id を設定
      const {
        data: [currentAccount],
        error: getError,
      } = await client
        .from('xxx')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('employee_id', employeeId);

      if (getError) {
        throw internalServerError();
      }

      if (!currentAccount) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      // TODO テーブル名を設定
      // TODO id を設定
      const { data, error } = await client.from('xxx').delete().eq('employee_id', employeeId);

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
