import { json, send } from 'micro';
import { client } from '../libs/db/client';
import { get, post, del, router, put } from 'microrouter';
import { internalServerError } from '../error';
import { jwtAuth } from '../utils';
import { roleValidate } from '../utils/validation';
import dotenv from 'dotenv';
dotenv.config();

const INVALID_ID = 'IDが不正です';

// TODO: リクエストパラメータを修正
export default router(
  get(
    '/api/role/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      const { data: role, error } = await client.from('role').select('*').eq('id', id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...role[0] };
    }),
  ),
  post(
    '/api/role',
    jwtAuth(async (req, res) => {
      try {
        const role = await json(req);
        const valid = roleValidate(role);
        if (!valid) {
          const message = roleValidate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('role').insert([{ ...role }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedRole = data;

        return { ...insertedRole };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  put(
    '/api/role/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;

      const message: Array<string> = [];
      if (!id) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentRole],
        error: getError,
      } = await client.from('role').select('*').eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentRole) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const role = await json(req);
      const valid = roleValidate(role);
      if (!valid) {
        message.push(...roleValidate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      const { data, error } = await client.from('role').update(role).eq('id', id);
      console.info(data, error);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const updatedRole = data[0];
      delete updatedRole.user_id;

      return { ...updatedRole, id: updatedRole.id.toString() };
    }),
  ),
  del(
    '/api/role/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;
      if (!id) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentRole],
        error: getError,
      } = await client.from('role').select('*').eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentRole) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const { data, error } = await client.from('role').delete().eq('id', id);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const deletedRole = data[0];
      return { ...deletedRole };
    }),
  ),
);
