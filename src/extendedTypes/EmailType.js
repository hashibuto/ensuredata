const StringType = require('../types/StringType');
const ValidationError = require('../errors/ValidationError');

/**
 * Performs email type validation
 *
 * @class EmailType
 * @extends {StringType}
 */
class EmailType extends StringType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    this.__mustContain = [];
    this._rules.push('must contain a valid email address');
  }

  test(value, isCreate=undefined) {
    value = super.test(value, isCreate);

    if (!EmailType.RE_EMAIL_ADDRESS.test(value)) {
      throw new ValidationError(
        null,
        'Must constitute a valid email address',
        value,
      );
    }

    return value;
  }

}

// This regular expression was borrowed from:
// https://www.w3resource.com/javascript/form/email-validation.php
EmailType.RE_EMAIL_ADDRESS = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

module.exports = EmailType;
