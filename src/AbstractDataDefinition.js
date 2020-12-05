const NotImplementedError = require('./errors/NotImplementedError');
const AbstractType = require("./types/AbstractType");
const ValidationError = require('./errors/ValidationError');
const DefinitionRegistry = require('./DefinitionRegistry');
const assert = require('assert');

/**
 * Implements a user defined object validator
 *
 * @class AbstractDataDefinition
 * @extends {AbstractType}
 */
class AbstractDataDefinition extends AbstractType {

  constructor() {
    // Default value not supported on user defined objects
    super(undefined);
  }

  /**
   * Returns the data definition for this data type.  The data definition consists of an
   * object of key/value pairs, whereby each key represents the key name on an object to
   * be validated, and the value represents the validator (as an instance of AbtractType).
   *
   * @readonly
   * @memberof AbstractDataDefinition
   */
  get definition() {
    throw new NotImplementedError();
  }

  /**
   * Data definitions which expose a base class for generic validation, mappable to a specific
   * sub class, must override this property on the base class implementation, and return the
   * object key name, which value is an EnumType, indicating which sub-definition is responsible
   * for validation.
   *
   * @readonly
   * @memberof AbstractDataDefinition
   */
  get typeKey() {
    return null;
  }

  /**
   * Data definitions that inherit from a common base must override this property, should
   * they wish to generically validate the object using the base type, to map to the
   * appropriate sub-type.  This typeName must be a member of the EnumType exposed by
   * the base class in the typeKey property.
   *
   * @readonly
   * @memberof AbstractDataDefinition
   */
  get typeName() {
    return null;
  }

  test(value, isCreate=undefined) {
    // First determine if this is a base class which needs to choose an appropriate subclass
    // for implementation

    if (this.typeKey !== null && this.typeName === null) {
      // This is a base class, choose the appropriate subclass
      assert (
        DefinitionRegistry.isValidatorSuperClass(this) === true,
        'Validation super class must be registered before it can be used'
      );

      const validatorInstance = DefinitionRegistry.getValidatorInstance(this, value);
      // Use the chosen validator subclass instead of this class, and continue
      return validatorInstance.test(value, isCreate);
    }

    value = super.test(value, isCreate);

    const definition = this.definition;
    const target = {};
    let key;

    try {
      for (key in definition) {
        const targetType = definition[key];
        if (
          isCreate === false ||
          targetType.isOnlyAfterCreate === false
        ) {
          // For data available only after creation, test only if the entity is not being created
          target[key] = targetType.test(value[key], isCreate);
        }
      }
    } catch(e) {
      if (e instanceof ValidationError) {
        // Apply the key to the error
        if (e.key === null) {
          e.key = key;
        } else {
          e.key = `${key}.${e.key}`;
        }
      }

      throw e;
    }

    return target;
  }

}

module.exports = AbstractDataDefinition;
