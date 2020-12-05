const ValidationError = require('../errors/ValidationError');
const ArrayType = require('./ArrayType');
const assert = require('assert');

/**
 * Implements a string validator
 *
 * @class StringType
 * @extends {ArrayType}
 */
class StringType extends ArrayType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    this.__trim = false;
  }

  /**
   * Trims the value being tested of trailing and leading whitespace prior to being validated for
   * any length constraints.  Ensures that the tested value returned is trimmed of trailing and
   * leading whitespace.
   *
   * @returns {StringType}
   * @memberof StringType
   */
  trim() {
    assert(this.__trim === false);
    this.__trim = true;
    this._rules.push(`will be stripped of any leading or trailing whitespace`);

    return this;
  }

  test(value, isCreate=undefined) {
    value = super.test(value, isCreate, true);

    if (this._isNullable === true && value === null) {
      return;
    }

    if (
      typeof value !== 'string'
    ) {
      throw new ValidationError(null, 'value must be a string', value);
    }

    if (this.__trim === true) {
      value = value.trim();
    }

    if (
      this._lowerBound === null &&
      value.length === 0
    ) {
      throw new ValidationError(null, `cannot be empty`, value);
    } else if (
      this._lowerBound !== null &&
      value.length < this._lowerBound
    ) {
      throw new ValidationError(null, `must contain at least ${this._lowerBound} characters`, value);
    }

    if (
      this._upperBound !== null &&
      value.length > this._upperBound
    ) {
      throw new ValidationError(null, `must contain at most ${this._upperBound} characters`, value);
    }

    return value;
  }

  fromString(value) {
    return value;
  }
}

module.exports = StringType;
