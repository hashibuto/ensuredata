
const _ = require('lodash');
const assert = require('assert');
const NotImplementedError = require('../errors/NotImplementedError');
const ValidationError = require('../errors/ValidationError');

/**
 * Defines a common interface for all data type validators
 *
 * @class AbstractType
 */
class AbstractType {

  /**
   * Creates an instance of AbstractType.
   *
   * @param {*} [defaultVal=undefined] - The default value to return when testing an undefined value
   * (ie. key is missing on a given object, etc.)
   * @memberof AbstractType
   */
  constructor(defaultVal=undefined) {
    this._customValidator = null;
    this._lowerBound = null;
    this._upperBound = null;
    this._isNullable = false;

    this.__defaultVal = defaultVal;
    this.__afterCreate = false;
    this._rules = [];
  }

  /**
   * Sets the validation logic that this element is only to be validated after creation, and is
   * not considered during any entity creation phase.  Example would be an object ID that gets
   * assigned during creation.
   *
   * @returns {AbstractType}
   * @memberof AbstractType
   */
  onlyAfterCreate() {
    assert(this.__afterCreate === false);
    this.__afterCreate = true;
    this._rules.push('only available after creation');

    return this;
  }

  /**
   * Sets the validation logic that this element is nullable.  Nullability means the object can
   * be set to "null".  It does NOT mean that the value can be undefined, such as in the case of
   * a missing item.
   *
   * @returns {AbstractType}
   * @memberof AbstractType
   */
  nullable() {
    assert(this._isNullable === false);
    this._isNullable = true;
    this._rules.push('is nullable');

    return this;
  }

  /**
   * Executes a custom validator, which takes the test data as its only argument.
   *
   * @param {function} cv - Custom validator function which takes value as an argument
   * @returns {AbstractType}
   * @memberof AbstractType
   */
  customValidate(cv) {
    assert(this._customValidator === null);
    // No validation rule text associated with custom validators.
    this._customValidator = cv;

    return this;
  }

  /**
   * Tests target value for compliance with validation logic.  Throws a ValidationError if
   * value does not comply, and returns value if it does comply.  Value will always be a new object
   * if it belongs to a mutable type, so downstream mutation is safe and will not damage upstream
   * objects.
   *
   * @param {*} value - The value to test for validation compliance
   * @param {Boolean} isCreate - Is the value being tested, part of a create operation.  Since some data
   * is not available during create, this is used to determine if those values need to be tested.
   * @returns
   * @memberof AbstractType
   */
  test(value, isCreate=undefined) {
    if (value === undefined) {
      if (this.defaultVal === undefined) {
        throw new ValidationError(null, 'value is required', value);
      } else {
        value = this.defaultVal;
      }
    }

    if (this._customValidator !== null) {
      value = this._customValidator(value);
    }

    return value;
  }

  /**
   * Returns an array of validation rules
   *
   * @readonly
   * @returns {Array}
   * @memberof AbstractType
   */
  get rules() {
    return this._rules
  }

  /**
   * Returns the name of the validation class
   *
   * @readonly
   * @returns {String}
   * @memberof AbstractType
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * Returns true if this validator only applies after object creation time
   *
   * @readonly
   * @returns {Boolean}
   * @memberof AbstractType
   */
  get isOnlyAfterCreate() {
    return this.__afterCreate;
  }

  /**
   * Returns the default value associated with this validator.  If the default value is a mutable
   * type, it will be copied and returned, in order to prevent downstream mutation from altering
   * the default.
   *
   * @readonly
   * @memberof AbstractType
   */
  get defaultVal() {
    if (this.__defaultVal instanceof Object) {
      // Always make a clone of a default value, unless it's an immutable type such as a string or
      // number
      return _.cloneDeep(this.__defaultVal);
    }

    return this.__defaultVal;
  }

  /**
   * Returns the empty value represented by the data type.
   *
   * @readonly
   * @memberof AbstractType
   */
  get empty() {
    throw NotImplementedError();
  }

  /**
   * Performs pre-processing of value as though it were to be reinterpreted from a string object.
   *
   * @param {*} value - The string value to be processed
   * @returns {*} - Returns the string data, re-interpreted into the data type expected by the
   * validation logic (if possible).  Must throw a validation error on failure.
   * @memberof AbstractType
   */
  fromString(value) {
    return value;
  }
}

module.exports = AbstractType;
