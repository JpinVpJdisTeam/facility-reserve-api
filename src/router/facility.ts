import { json, send } from 'micro';
import { sign } from 'jsonwebtoken';
import { client } from '../libs/db/client';
import { get, post, del, router, put } from 'microrouter';
import { internalServerError } from '../error';
import { jwtAuth } from '../utils';
import { facilityValidate } from '../utils/validation';
import dotenv from 'dotenv';
dotenv.config();

const INVALID_ID = 'IDが不正です';

export default router(
  post(
    '/api/facility',
    jwtAuth(async (req, res) => {
      try {
        const reqData = await json(req);
        const valid = facilityValidate(reqData);
        if (!valid) {
          const message = facilityValidate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { hub_id: hubId } = reqData;
        const { data, error } = await client.from('facility').select('*').eq('hub_id', hubId);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }
        return { ...data };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
);
