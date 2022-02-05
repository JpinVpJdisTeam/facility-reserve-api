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
    '/api/hub',
    jwtAuth(async (req) => {
      const { data: hub, error } = await client.from('hub').select('id, name');
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...hub };
    }),
  ),
);
