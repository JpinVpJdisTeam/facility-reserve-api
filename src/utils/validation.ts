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
      type: 'string',
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
      type: 'string',
      description: '拠点ID',
    },
    department_id: {
      type: 'string',
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
      type: 'string',
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

// const schema = {
//   type: 'object',
//   properties: {
//     id: {
//       type: 'string',
//       description: 'ID',
//     },
//     title: {
//       type: 'string',
//       description: 'タイトル',
//       transform: ['trim'],
//       minLength: 1,
//     },
//     category: {
//       type: 'string',
//       description: 'カテゴリ(任意の文字列をフロントで設定)',
//     },
//     description: {
//       type: 'string',
//       description: '内容(改行を含む(textarea))',
//     },
//     date: {
//       type: 'string',
//       description: '日付',
//       format: 'custom-date',
//     },
//     mark_div: {
//       type: 'number',
//       description: 'マークつけるか区分(0:つけない、1:つける)',
//     },
//   },
//   required: ['title'],
//   additionalProperties: false,
//   errorMessage: {
//     required: {
//       title: 'タイトルは必須です',
//     },
//     properties: {
//       title: 'タイトルは必須です',
//       mark_div: 'マーク区分は数値で入力してください',
//       date: '日付の形式が不正です',
//     },
//   },
// };

export const validate = ajv.compile(schema);
