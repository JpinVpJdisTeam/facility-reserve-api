import { json, send } from 'micro';
import { sign } from 'jsonwebtoken';
import { client } from '../libs/db/client';
import { get, post, del, router, put } from 'microrouter';
import { internalServerError } from '../error';
import { jwtAuth } from '../utils';
import { departmentValidate } from '../utils/validation';
import dotenv from 'dotenv';
dotenv.config();

const INVALID_ID = 'IDが不正です';

export default router(
  get(
    '/api/department/:hub_id',
    jwtAuth(async (req) => {
      const { hub_id } = req.params;
      const { data: department, error } = await client
        .from('department')
        .select('id, name, hub_id')
        .eq('hub_id', hub_id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...department[0] };
    }),
  ),
  post(
    '/api/department',
    jwtAuth(async (req, res) => {
      try {
        const department = await json(req);
        const valid = departmentValidate(department);
        if (!valid) {
          const message = departmentValidate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('department').insert([{ ...department }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedDepartment = data;

        return { ...insertedDepartment };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  put(
    '/api/department/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;

      const message: Array<string> = [];
      if (!id) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentDepartment],
        error: getError,
      } = await client.from('department').select('id, name, hub_id').eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentDepartment) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const department = await json(req);
      const valid = departmentValidate(department);
      if (!valid) {
        message.push(...departmentValidate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      const { data, error } = await client.from('department').update(department).eq('id', id);
      console.info(data, error);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const updatedDepartment = data[0];
      delete updatedDepartment.user_id;

      return { ...updatedDepartment, id: updatedDepartment.id.toString() };
    }),
  ),
  del(
    '/api/department/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;
      if (!id) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentDepartment],
        error: getError,
      } = await client.from('department').select('id, name, hub_id').eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentDepartment) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const { data, error } = await client.from('department').delete().eq('id', id);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const deletedDepartment = data[0];
      return { ...deletedDepartment };
    }),
  ),
);
