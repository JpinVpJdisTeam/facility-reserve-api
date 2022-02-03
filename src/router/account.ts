import { json, send } from 'micro';
// import { post, router } from 'microrouter';
import { sign } from 'jsonwebtoken';
import { client } from '../libs/db/client';
// import { json, send } from 'micro';
import { get, post, del, router, put } from 'microrouter';
import { internalServerError } from '../error';
// import { client } from '../libs/db/client';
import { jwtAuth } from '../utils';
import { validate } from '../utils/validation';
import dotenv from 'dotenv';
dotenv.config();

export default router(
  post(
    '/api/account',
    jwtAuth(async (req, res) => {
      try {
        const { id } = req.jwt;
        const account = await json(req);
        const valid = validate(account);
        if (!valid) {
          const message = validate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('account').insert([{ employee_id: id, ...account }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedAccount = data[0];
        delete insertedAccount.user_id;

        return { ...insertedAccount, id: insertedAccount.id.toString() };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),

  // post(
  //   '/api/memo',
  //   jwtAuth(async (req, res) => {
  //     try {
  //       const { id } = req.jwt;
  //       const memo = await json(req);
  //       const valid = validate(memo);
  //       if (!valid) {
  //         const message = validate.errors.map((item) => item.message);
  //         send(res, 400, { message });
  //         return;
  //       }

  //       const { data, error } = await client.from('memo-old').insert([{ user_id: id, ...memo }]);
  //       if (error) {
  //         console.info('error', error);
  //         throw internalServerError(error.message);
  //       }
  //       if (data.length == 0) {
  //         throw internalServerError();
  //       }

  //       const insertedMemo = data[0];
  //       delete insertedMemo.user_id;

  //       return { ...insertedMemo, id: insertedMemo.id.toString() };
  //     } catch (error) {
  //       throw internalServerError(error.message);
  //     }
  //   }),
  // ),
  // post('/api/login', async (req, res) => {
  //   const data = await json(req);
  //   const { email, password } = data;

  //   // TODO パスワードの暗号化とかセキュアな方法調査(?)
  //   const { data: users } = await client.from('user-old').select('*').eq('email', email);

  //   if (users.length === 0) {
  //     send(res, 401, {
  //       message: 'unauthorized',
  //     });
  //     return;
  //   }
  //   const user = users[0];

  //   if (user.password !== password) {
  //     send(res, 401, {
  //       message: 'unauthorized',
  //     });
  //     return;
  //   }

  //   const token = sign({ id: user.id }, JWT_SECRET, {
  //     expiresIn: `${process.env.TOKEN_EXPIRED_HOUR}h`,
  //   });

  //   return { access_token: token };
  // }),
  // post('/api/logout', async () => {
  //   return { message: 'logout' };
  // }),
);
