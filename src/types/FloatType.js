const ValidationError = require('../errors/ValidationError');
const AbstractType = require('./AbstractType');
const DataTypeUtils = require('../utils/DataTypeUtils');
const assert = require('assert');

/**
 * Implements a float validator
 *
 * @class FloatType
 * @extends {AbstractType}
 */
class FloatType extends AbstractType {

  /**
   * Enforces that test values must not be lower than the supplied value
   *
   * @param {Number} lowerBound - The value which tested values must not be lower than
   * @returns {FloatType}
   * @memberof FloatType
   */
  from(lowerBound) {
    assert(this._lowerBound === null);
    assert(this._isRightDataType(lowerBound));
    this._lowerBound = lowerBound;
    this._rules.push(`minimum value of ${lowerBound}`);

    return this;
  }

  /**
   * Enforces that test values must not be greater than the supplied value
   *
   * @param {Number} upperBound - The value which tested values must not be greater than
   * @returns {FloatType}
   * @memberof FloatType
   */
  to(upperBound) {
    assert(this._upperBound === null);
    assert(this._isRightDataType(upperBound));
    this._upperBound = upperBound;
    this._rules.push(`maximum value of ${upperBound}`);

    return this;
  }

  test(value, isCreate=undefined) {
    value = super.test(value, isCreate);

    if (this._isNullable === true && value === null) {
      return;
    }

    if (
      typeof value !== 'number'
    ) {
      throw new ValidationError(null, 'value must be a number', value);
    }

    if (
      this._lowerBound !== null &&
      value < this._lowerBound
    ) {
      throw new ValidationError(null, `value must be greater than or equal to ${this._lowerBound}`, value);
    }

    if (
      this._upperBound !== null &&
      value > this._upperBound
    ) {
      throw new ValidationError(null, `value must be less than or equal to ${this._upperBound}`, value);
    }

    return value;
  }

  /**
   * Returns true if value is a number
   *
   * @param {*} value
   * @returns
   * @memberof FloatType
   */
  _isRightDataType(value) {
    return DataTypeUtils.isNumber(value);
  }

  fromString(value) {
    return parseFloat(value);
  }
}

module.exports = FloatType;
