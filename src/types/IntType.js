const ValidationError = require('../errors/ValidationError');
const FloatType = require('./FloatType');
const DataTypeUtils = require('../utils/DataTypeUtils');

/**
 * Implements an integer validator
 *
 * @class IntType
 * @extends {FloatType}
 */
class IntType extends FloatType {

  test(value, isCreate=undefined) {
    value = super.test(value, isCreate);

    if (this._isNullable === true && value === null) {
      return;
    }

    super.test(value, isCreate);
    if (Math.floor(value) !== value) {
      throw new ValidationError(null, 'value must be an integer', value);
    }

    return value;
  }

  /**
   * Returns true if value is an integer
   *
   * @param {*} value
   * @returns
   * @memberof FloatType
   */
  _isRightDataType(value) {
    return DataTypeUtils.isInteger(value);
  }

  fromString(value) {
    return parseInt(value);
  }
}

module.exports = IntType;
