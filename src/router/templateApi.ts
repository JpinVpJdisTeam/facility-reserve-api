import { json, send } from 'micro';
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
// TODO: x_x を リネーム
// TODO: Xxx を リネーム
// TODO: SQL を修正
// TODO: リクエストパラメータを修正
export default router(
  get(
    '/api/x_x/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      const { data: xxx, error } = await client
        .from('x_x')
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
    '/api/x_x',
    jwtAuth(async (req, res) => {
      try {
        const xxx = await json(req);
        const valid = validate(xxx);
        if (!valid) {
          const message = validate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('x_x').insert([{ ...xxx }]);
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
    '/api/x_x/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;

      const message: Array<string> = [];
      if (!id) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentXxx],
        error: getError,
      } = await client
        .from('x_x')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentXxx) {
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

      const { data, error } = await client.from('x_x').update(xxx).eq('id', id);
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
    '/api/x_x/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;
      if (!id) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentXxx],
        error: getError,
      } = await client
        .from('x_x')
        .select('employee_id, name, furigana, hub_id, department_id, tel, email, role_id')
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentXxx) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const { data, error } = await client.from('x_x').delete().eq('id', id);

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
