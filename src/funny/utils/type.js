const isNull = (n) => n === null || n === undefined;

const isNumber = (n) => typeof n === 'number';

const isString = (n) => typeof n === 'string';

const isArray = (n) => Array.isArray(n);

const isBool = (n) => typeof n === 'boolean';

const isObject = (n) => n !== null && typeof n === 'object';

const isFunction = (n) => typeof n === 'function';

const isPrimitive = (n) => isNull(n) || isNumber(n) || isBool() || isString(n);

export default {
  isNull,
  isNumber,
  isString,
  isArray,
  isBool,
  isObject,
  isFunction,
  isPrimitive,
};
