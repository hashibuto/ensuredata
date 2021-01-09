const ValidationError = require('../errors/ValidationError');
const AbstractType = require('./AbstractType');
const DataTypeUtils = require('../utils/DataTypeUtils');
const assert = require('assert');

/**
 * Implements an array validator
 *
 * @class ArrayType
 * @extends {AbstractType}
 */
class ArrayType extends AbstractType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    this.__ofType = null;
    this.__noDuplicates = false;
  }

  /**
   * Enforces that test values contains a minimum of n elements.  By default, 0 elements is
   * considered invalid and does not require explicit specification.
   *
   * @param {Number} minElements - The minimum number of required elements
   * @returns {ArrayType}
   * @memberof ArrayType
   */
  minLength(minElements) {
    assert(DataTypeUtils.isInteger(minElements));
    assert(this._lowerBound === null);
    this._lowerBound = minElements;
    this._rules.push(`minimum of ${minElements} elements`);

    return this;
  }

  /**
   * Enforces that test values contains a maximum of n elements.
   *
   * @param {Number} minElements - The maximum number of elements permitted
   * @returns {ArrayType}
   * @memberof ArrayType
   */
  maxLength(maxElements) {
    assert(DataTypeUtils.isInteger(maxElements));
    assert(this._upperBound === null);
    this._upperBound = maxElements;
    this._rules.push(`maximum of ${maxElements} elements`);

    return this;
  }

  /**
   * Enforces that test values contain only elements of the specified type
   *
   * @param {AbstractType} dataType - The required element type
   * @returns {ArrayType}
   * @memberof ArrayType
   */
  ofType(dataType) {
    assert(this.__ofType === null);
    assert(dataType instanceof AbstractType);
    this.__ofType = dataType;
    this._rules.push(`contain only type of ${dataType.name}`);

    return this;
  }

  /**
   * Enforces that test values contain no duplicate items.  Only immutable types such as numbers
   * and strings can be enforced using this requirement specifier.
   *
   * @returns {ArrayType}
   * @memberof ArrayType
   */
  noDuplicates() {
    assert(this.__noDuplicates === false);
    this.__noDuplicates = true;
    this._rules.push('cannot contain duplicate elements');

    return this;
  }

  test(value, isCreate=undefined, onlySuper=false) {
    value = super.test(value, isCreate=undefined);
    let newValue = value;

    if (onlySuper === false) {
      if (this._isNullable === true && value === null) {
        return value;
      }

      if (!Array.isArray(value)) {
        throw new ValidationError(null, 'must be an array', value);
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
        throw new ValidationError(null, `must contain at least ${this._lowerBound} elements`, value);
      }

      if (
        this._upperBound !== null &&
        value.length > this._upperBound
      ) {
        throw new ValidationError(null, `must contain at most ${this._upperBound} elements`, value);
      }

      if (this.__ofType !== null) {
        newValue = [];
        value.forEach(element => {
          newValue.push(this.__ofType.test(element, isCreate));
        })
      } else {
        newValue = value;
      }

      if (this.__noDuplicates === true) {
        // Consume the array into a set and ensure the size matches the original size.  This is a
        // trivial comparison used for numbers and strings only.

        const set = new Set(newValue);
        if (set.size !== newValue.length) {
          throw new ValidationError(null, 'duplicate elements not allowed', value);
        }
      }
    }

    return newValue;
  }

  fromString(value) {
    try {
      return JSON.parse(value);
    } catch(e) {
      throw new ValidationError(null, 'could not be parsed from string', value);
    }
  }

  get empty() {
    return [];
  }
}

module.exports = ArrayType;
