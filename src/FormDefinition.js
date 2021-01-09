const assert = require('assert');
const AbstractType = require('./types/AbstractType');
const ValidationError = require('./errors/ValidationError');
const { exception } = require('console');

class FormDefinition {

  /**
   * Creates an instance of FormDefinition.
   *
   * @param {object} definition
   * @memberof FormDefinition
   */
  constructor(definition) {
    for (let key in definition) {
      const value = definition[key];
      assert(
        value instanceof AbstractType,
        "Definitions consist of str/AbstractType instance (key/value) pairs"
      );

      let empty;
      try {
        empty = value.empty;
      } catch(e) {
        empty = undefined;
      }

      assert (
        value.defaultVal !== undefined ||
        empty !== undefined,
        `Validator for ${key} requires a default value`
      );
    }

    this.__definition = definition;
  }

  /**
   *
   *
   * @param {*} formData
   * @returns {object} - An object where key is the failing key in the definition and the value is
   *  the validation failure message.
   * @memberof FormDefinition
   */
  getErrors(formData) {
    const errors = {};

    for (let key in this.__definition) {
      const dataTypeInst = this.__definition[key];

      if (key in formData) {
        try {
          dataTypeInst.test(formData[key], true);
        } catch(e) {
          if (e instanceof ValidationError) {
            errors[key] = e.message;
          } else {
            throw e;
          }
        }
      } else {
        // This should break the code so that the developer knows there's a problem.
        // Forms are in-client and should never be missing data
        throw new ValidationError(`Field ${key} is missing from formData`);
      }
    }

    return errors;
  }

  /**
   * Initializes and returns an object matching the form definition, where values are empty or
   * default values defined for each validator.
   *
   * @returns
   * @memberof FormDefinition
   */
  initialize() {
    const data = {};

    for (let key in this.__definition) {
      const validator = this.__definition[key];
      let initValue = validator.defaultVal;
      if (initValue === undefined) {
        initValue = validator.empty;
      }

      data[key] = initValue;
    }

    return data;
  }

}

module.exports = FormDefinition;
