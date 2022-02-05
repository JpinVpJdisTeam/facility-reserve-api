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
    hub_id: {
      type: 'integer',
      description: '拠点ID',
    },
  },
  required: ['hub_id'],
  additionalProperties: false,
  errorMessage: {
    required: {
      hub_id: '拠点IDは必須です',
    },
    properties: {
      hub_id: '拠点IDは必須です',
    },
  },
};

export const validate = ajv.compile(schema);
export const facilityValidate = ajv.compile(facilitySchema);
