import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvKeywords from 'ajv-keywords';
import ajvFormats from 'ajv-formats';
const ajv = new Ajv({ allErrors: true });
ajvKeywords(ajv, ['transform']);
ajvErrors(ajv);
ajvFormats(ajv);

ajv.addFormat('custom-date', (str) => {
  const valid = new Date(str).toString() !== 'Invalid Date';
  return valid;
});

const schema = {
  type: 'object',
  properties: {
    employee_id: {
      type: 'integer',
      description: '社員ID',
    },
    name: {
      type: 'string',
      description: '氏名',
    },
    furigana: {
      type: 'string',
      description: 'ふりがな',
    },
    hub_id: {
      type: 'integer',
      description: '拠点ID',
    },
    department_id: {
      type: 'integer',
      description: '部署ID',
    },
    tel: {
      type: 'string',
      description: '電話番号',
    },
    email: {
      type: 'string',
      description: 'メールアドレス',
    },
    role_id: {
      type: 'integer',
      description: 'ロールID',
    },
  },
  required: ['employee_id', 'name', 'hub_id', 'department_id', 'role_id'],
  additionalProperties: false,
  errorMessage: {
    required: {
      employee_id: '社員IDは必須です',
      name: '氏名は必須です',
      hub_id: '拠点IDは必須です',
      department_id: '部署IDは必須です',
      role_id: '役割IDは必須です',
    },
    properties: {
      employee_id: '社員IDは必須です',
      name: '氏名は必須です',
      hub_id: '拠点IDは必須です',
      department_id: '部署IDは必須です',
      role_id: '役割IDは必須です',
    },
  },
};

const facilitySchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '施設名',
    },
    hub_id: {
      type: 'integer',
      description: '拠点ID',
    },
    hourly_fees: {
      type: 'integer',
      description: '１時間当たりの利用料金',
    },
    reservable_timezone_start_time: {
      type: 'string',
      format: 'time',
      description: '予約可能時間帯の開始時刻',
    },
    reservable_timezone_end_time: {
      type: 'string',
      format: 'time',
      description: '予約可能時間帯の終了時刻',
    },
    continuous_avairable_time: {
      type: 'string',
      format: 'time',
      description: '連続利用可能時間',
    },
  },
  required: [
    'name',
    'hub_id',
    'hourly_fees',
    'reservable_timezone_start_time',
    'reservable_timezone_end_time',
    'continuous_avairable_time',
  ],
  additionalProperties: false,
  errorMessage: {
    required: {
      name: '施設名は必須です',
      hub_id: '拠点IDは必須です',
      hourly_fees: '１時間当たりの利用料金は必須です',
      reservable_timezone_start_time: '予約可能時間帯の開始時刻は必須です',
      reservable_timezone_end_time: '予約可能時間帯の終了時刻は必須です',
      continuous_avairable_time: '連続利用可能時間は必須です',
    },
  },
};

const reservationSchema = {
  type: 'object',
  properties: {
    facility_id: {
      type: 'integer',
      description: '施設ID',
    },
    title: {
      type: 'string',
      description: 'タイトル',
    },
    reservation_person_id: {
      type: 'integer',
      description: '予約者ID',
    },
    tel: {
      type: 'string',
      description: '予約者電話番号',
    },
    usage_date: {
      type: 'string',
      format: 'date',
      description: '予約日',
    },
    start_time: {
      type: 'string',
      format: 'time',
      description: '予約開始時間',
    },
    end_time: {
      type: 'string',
      format: 'time',
      description: '予約終了時間',
    },
    is_private: {
      type: 'boolean',
      description: '非公開有無',
    },
    remarks: {
      type: 'string',
      description: '備考',
    },
  },
  required: ['facility_id', 'title', 'reservation_person_id', 'tel', 'usage_date', 'start_time', 'end_time'],
  additionalProperties: false,
  errorMessage: {
    required: {
      facility_id: '施設IDは必須です',
      title: 'タイトルは必須です',
      reservation_person_id: '予約者は必須です',
      tel: '電話番号は必須です',
      usage_date: '予約日は必須です',
      start_time: '予約開始時間は必須です',
      end_time: '予約終了時間は必須です',
    },
  },
};

export const validate = ajv.compile(schema);
export const facilityValidate = ajv.compile(facilitySchema);
export const reservationValidate = ajv.compile(reservationSchema);
