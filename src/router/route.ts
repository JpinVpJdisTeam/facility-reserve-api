import { router } from 'microrouter';
import microCors from 'micro-cors';
import authRouter from './auth';
import memoRouter from './memo';
import accountRouter from './account';
import hubRouter from './hub';
import facilityRouter from './facility';
import reservationRouter from './reservation';

const cors = microCors();

export const route = cors(router(authRouter, memoRouter, accountRouter, hubRouter, facilityRouter, reservationRouter));
