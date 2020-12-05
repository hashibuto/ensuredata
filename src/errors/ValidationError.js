/**
 * Indicates that data validation has failed.
 *
 * @class ValidationError
 * @extends {Error}
 */
class ValidationError extends Error {

  /**
   * Creates an instance of ValidationError.
   *
   * @param {?String} key - The key in the object failing validation (if available)
   * @param {String} message - Message indicating what validation condition failed
   * @param {*} [value=undefined] - The value which triggered the validation failure (if available)
   * @memberof ValidationError
   */
  constructor(key, message, value=undefined) {
    super(message);

    this.key = key;
    this.value = value;
  }

}

module.exports = ValidationError;
