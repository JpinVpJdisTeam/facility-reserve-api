// @ts-nocheck
import { json, send } from 'micro';
import { client } from '../libs/db/client';
import { get, post, del, router, put } from 'microrouter';
import { internalServerError } from '../error';
import { jwtAuth } from '../utils';
import { usageFeeValidate } from '../utils/validation';
import dotenv from 'dotenv';
dotenv.config();

const INVALID_ID = 'IDが不正です';

export default router(
  get(
    '/api/usage_fee/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      const { data: usageFee, error } = await client
        .from('usage_fee')
        .select('facility_id, reservation_person_id, date, time, fee')
        .eq('id', id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...usageFee[0] };
    }),
  ),
  post(
    '/api/usage_fee_month',
    jwtAuth(async (req, res) => {
      try {
        const { month, day, department_id } = await json(req);
        // const valid = usageFeeValidate(usageFee);
        // if (!valid) {
        //   const message = usageFeeValidate.errors.map((item) => item.message);
        //   send(res, 400, { message });
        //   return;
        // }
        if (month === null || day === null || department_id === null) {
          return;
        }

        const data = await client
          .from('usage_fee')
          .select('hub (name), facility (name), reservation_person_id, time, fee')
          .contains('date', month + '-' + day)
          .eq('account (department_id)', department_id);
        console.log('data: ', data);
        // .eq('hub_id', hub_id)
        // .eq('department_id', department_id);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedUsageFee = data;

        return { ...insertedUsageFee };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  post(
    '/api/usage_fee',
    jwtAuth(async (req, res) => {
      try {
        const usageFee = await json(req);
        const valid = usageFeeValidate(usageFee);
        if (!valid) {
          const message = usageFeeValidate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('usage_fee').insert([{ ...usageFee }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedUsageFee = data;

        return { ...insertedUsageFee };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  put(
    '/api/usage_fee/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;

      const message: Array<string> = [];
      if (!id) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentUsageFee],
        error: getError,
      } = await client.from('usage_fee').select('facility_id, reservation_person_id, date, time, fee').eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentUsageFee) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const usageFee = await json(req);
      const valid = usageFeeValidate(usageFee);
      if (!valid) {
        message.push(...usageFeeValidate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      const { data, error } = await client.from('usage_fee').update(usageFee).eq('id', id);
      console.info(data, error);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const updatedUsageFee = data[0];
      delete updatedUsageFee.user_id;

      return { ...updatedUsageFee, id: updatedUsageFee.id.toString() };
    }),
  ),
  del(
    '/api/usage_fee/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;
      if (!id) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentUsageFee],
        error: getError,
      } = await client.from('usage_fee').select('facility_id, reservation_person_id, date, time, fee').eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentUsageFee) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const { data, error } = await client.from('usage_fee').delete().eq('id', id);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const deletedUsageFee = data[0];
      return { ...deletedUsageFee };
    }),
  ),
);
