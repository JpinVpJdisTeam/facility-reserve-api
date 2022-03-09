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
  get(
    '/api/facility/:id',
    jwtAuth(async (req) => {
      const { id } = req.params;
      const { data: facility, error } = await client
        .from('facility')
        .select(
          'name, hub_id, hourly_fees, reservable_timezone_start_time, reservable_timezone_end_time, continuous_avairable_time',
        )
        .eq('hub_id', id);
      if (error) {
        console.log(error);
        throw internalServerError(error.message);
      }

      return { ...facility };
    }),
  ),
  post(
    '/api/facility',
    jwtAuth(async (req, res) => {
      try {
        const facility = await json(req);
        const valid = facilityValidate(facility);
        if (!valid) {
          const message = facilityValidate.errors.map((item) => item.message);
          send(res, 400, { message });
          return;
        }
        const { data, error } = await client.from('facility').insert([{ ...facility }]);
        if (error) {
          console.info('error', error);
          throw internalServerError(error.message);
        }
        if (data.length == 0) {
          throw internalServerError();
        }

        const insertedFacility = data;

        return { ...insertedFacility };
      } catch (error) {
        throw internalServerError(error.message);
      }
    }),
  ),
  put(
    '/api/facility/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;

      const message: Array<string> = [];
      if (!id) {
        message.push(INVALID_ID);
      }

      const {
        data: [currentFacility],
        error: getError,
      } = await client
        .from('facility')
        .select(
          'name, hub_id, hourly_fees, reservable_timezone_start_time, reservable_timezone_end_time, continuous_avairable_time',
        )
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentFacility) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const facility = await json(req);
      const valid = facilityValidate(facility);
      if (!valid) {
        message.push(...facilityValidate.errors.map((item) => item.message));
      }

      if (message.length > 0) {
        send(res, 400, { message });
        return;
      }

      const { data, error } = await client.from('facility').update(facility).eq('id', id);
      console.info(data, error);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const updatedFacility = data[0];
      return { ...updatedFacility };
    }),
  ),
  del(
    '/api/facility/:id',
    jwtAuth(async (req, res) => {
      const { id: id } = req.params;
      if (!id) {
        return { message: [INVALID_ID] };
      }

      const {
        data: [currentFacility],
        error: getError,
      } = await client
        .from('facility')
        .select(
          'name, hub_id, hourly_fees, reservable_timezone_start_time, reservable_timezone_end_time, continuous_avairable_time',
        )
        .eq('id', id);

      if (getError) {
        throw internalServerError();
      }

      if (!currentFacility) {
        send(res, 400, { message: 'IDが不正です' });
        return;
      }

      const { data, error } = await client.from('facility').delete().eq('id', id);

      if (error) {
        throw internalServerError();
      }
      if (data.length === 0) {
        throw internalServerError();
      }

      const deletedFacility = data[0];
      return { ...deletedFacility };
    }),
  ),
);
