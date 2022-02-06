import { json, send } from 'micro';
import { sign } from 'jsonwebtoken';
import { client } from '../libs/db/client';
import { get, post, del, router, put } from 'microrouter';
import { internalServerError } from '../error';
import { jwtAuth } from '../utils';
import { reservationValidate } from '../utils/validation';
import dotenv from 'dotenv';
dotenv.config();

const INVALID_ID = 'IDが不正です';

export default router(
  post(
    '/api/reservation-info',
    jwtAuth(async (req) => {
      const { facility_id: facilityId, usage_date: usageDate } = await json(req);
      const { data: reservation, error } = await client
        .from('reservation')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('usage_date', usageDate);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...reservation };
    }),
  ),
  get(
    '/api/reservation/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      const { data: reservation, error } = await client
        .from('reservation')
        .select('facility_id, title, reservation_person_id, tel, usage_date, start_time, end_time, is_private, remarks')
        .eq('id', id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...reservation[0] };
    }),
  ),
  post(
    '/api/reservation',
    jwtAuth(async (req, res) => {
      try {
        const reservation = await json(req);
        const valid = reservationValidate(reservation);
        if (!valid) {
          const message = reservationValidate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('reservation').insert([{ ...reservation }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedReservation = data;

        return { ...insertedReservation };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  put(
    '/api/reservation/:id',
    jwtAuth(async (req, res) => {
      const { id } = req.params;

      const message: Array<string> = [];
      if (!id) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentReservation],
        error: getError,
      } = await client
        .from('reservation')
        .select('facility_id, title, reservation_person_id, tel, usage_date, start_time, end_time, is_private, remarks')
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      console.log('test');

      if (!currentReservation) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const reservation = await json(req);
      const valid = reservationValidate(reservation);
      if (!valid) {
        message.push(...reservationValidate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      const { data, error } = await client.from('reservation').update(reservation).eq('id', id);
      console.info(data, error);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const updatedReservation = data[0];
      delete updatedReservation.user_id;

      return { ...updatedReservation, id: updatedReservation.id.toString() };
    }),
  ),
  del(
    '/api/reservation/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;
      if (!id) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentAccount],
        error: getError,
      } = await client
        .from('reservation')
        .select('facility_id, title, reservation_person_id, tel, usage_date, start_time, end_time, is_private, remarks')
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentAccount) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      // TODO テーブル名を設定
      // TODO id を設定
      const { data, error } = await client.from('reservation').delete().eq('id', id);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const deletedReservation = data[0];
      return { ...deletedReservation };
    }),
  ),
);
