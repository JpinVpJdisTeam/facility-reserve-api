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
        const { year, month, department_id } = await json(req);
        if (year === null || month === null || department_id === null) {
          throw internalServerError('parameter invalid.');
        }

        const { data, error } = await client
          .from('usage_fee')
          .select('date, facility(name, hub(name)), account(name), reservation_person_id, time, fee')
          .eq('account.department_id', department_id)
          .gte('date', year + '-' + month + '-' + '01')
          .lte('date', year + '-' + month + '-' + '28'); // TODO 適切な末日を設定
        console.log('data: ', data);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          3;
          throw internalServerError();
        }

        const insertedUsageFee = data.map((item) => {
          return {
            'date': item.date,
            'reservation_person_id': item.reservation_person_id,
            'time': item.time,
            'fee': item.fee,
            'account_name': item.account.name,
            'facility_name': item.facility.name,
            'hub_name': item.facility.hub.name,
          };
        });

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
