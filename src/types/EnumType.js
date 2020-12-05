const AbstractType = require('./AbstractType');
const ValidationError = require('../errors/ValidationError');
const NotImplementedError = require('../errors/NotImplementedError');
const assert = require('assert');

/**
 * Implements an enum validator
 *
 * @class EnumType
 * @extends {AbstractType}
 */
class EnumType extends AbstractType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    const collection = this.collection;
    assert(Array.isArray(collection));

    collection.forEach(item => {
      assert(typeof item === 'string');
    })

    this.__lookup = new Set(collection);
    assert(this.__lookup.size === collection.length);
  }

  /**
   * Returns an array of enumerated items.
   *
   * @readonly
   * @returns {Array}
   * @memberof EnumType
   */
  get collection() {
    throw new NotImplementedError();
  }

  test(value, isCreate=undefined) {
    value = super.test(value, isCreate);

    if (this._isNullable === true && value === null) {
      return;
    }

    if (!this.__lookup.has(value)) {
      throw new ValidationError(null, `not a member of ${this.name}`, value);
    }

    return value;
  }

}

module.exports = EnumType;
