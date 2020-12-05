const EnumType = require('./types/EnumType');
const assert = require('assert');
const ValidationError = require('./errors/ValidationError');
const AbstractDataDefinition = require('./AbstractDataDefinition');

/**
 * The definition registry is where data definition classes are registered, and mappings from
 * super classes to subclasses based on data type are stored.
 *
 * @class DefinitionRegistry
 */
class DefinitionRegistry {

  static DEFINITION_BY_CLASS_NAME = {};
  static REGISTERED_CLASSES = new Set();
  static BASE_MAPPING_TO_IMPLEMENTATION = {};
  static BASE_CLASSES = [];
  static BASE_INSTANCE_BY_NAME = {};

  /**
   * Registers a data definition class.  The main purpose of registration of data defintion
   * classes, is to support inheritance based definition selection.  What this means is that
   * if a user defined message/object wants to use *any* subclass of a given definition super
   * class in order to validate a particular object, that hierarchy needs to be defined and
   * all members registered.
   *
   * @static
   * @param {*} dataDefinitionType
   * @memberof DefinitionRegistry
   */
  static register(dataDefinitionType) {
    assert(!DefinitionRegistry.REGISTERED_CLASSES.has(dataDefinitionType));

    const typeName = dataDefinitionType.name;
    assert(typeName !== undefined);
    assert(!(typeName in DefinitionRegistry.DEFINITION_BY_CLASS_NAME));

    const inst = new dataDefinitionType();

    if (inst.typeKey !== null && inst.typeName === null) {
      // If the instance has a typeKey declared but no type name, we know this is an inherited
      // base class being registered.  Make a record of the base class, so that message type
      // can be mapped to an instance

      assert(inst.typeKey in inst.definition, `The key ${inst.typeKey} must be present in the definition`);
      assert(inst.definition[inst.typeKey] instanceof EnumType, `The key ${inst.typeKey} must be present in the definition`);
      DefinitionRegistry.BASE_MAPPING_TO_IMPLEMENTATION[typeName] = {};
      DefinitionRegistry.BASE_CLASSES.push(dataDefinitionType);
      DefinitionRegistry.BASE_INSTANCE_BY_NAME[typeName] = inst;
    } else if (inst.typeKey !== null && inst.typeName !== null) {
      // If a type key and type name is available, then this is an implemenation of a common
      // subclass.  We have to ensure that it has already been registered.

      let foundBase = false;
      let baseClass = null;
      for (let b of DefinitionRegistry.BASE_CLASSES) {
        if (inst instanceof b) {
          foundBase = true;
          baseClass = b;
          break;
        }
      }

      assert(
        foundBase === true,
        `The base class of ${typeName} which implements the ".typeKey" property must be registered`
      );

      // Set up the validator mapping
      const baseInst = DefinitionRegistry.BASE_INSTANCE_BY_NAME[baseClass.name];
      assert(baseInst.typeKey === inst.typeKey, 'The .typeKey property must not be overridden more than once');
      try {
        baseInst.definition[baseInst.typeKey].test(inst.typeName);
      } catch(e) {
        if (e instanceof ValidationError) {
          assert(false, `The .typeName property on ${typeName} must be a member of the enum on the base at .typeKey`);
        }

        throw e;
      }

      DefinitionRegistry.BASE_MAPPING_TO_IMPLEMENTATION[baseClass.name][inst.typeName] = inst;
    }
  }

  /**
   * Returns true if the data type definition (class) is registered.
   *
   * @static
   * @param {*} dataDefinitionType - Data definition class
   * @returns {Boolean}
   * @memberof DefinitionRegistry
   */
  static isRegistered(dataDefinitionType) {
    return DefinitionRegistry.REGISTERED_CLASSES.has(dataDefinitionType);
  }

  /**
   * Returns true if the supplied data definition instance is a super class of other
   * data definition classes.
   *
   * @static
   * @param {AbstractDataDefinition} dataDefinitionInst
   * @returns {Boolean}
   * @memberof DefinitionRegistry
   */
  static isValidatorSuperClass(dataDefinitionInst) {
    const name = dataDefinitionInst.constructor.name;
    return (name in DefinitionRegistry.BASE_INSTANCE_BY_NAME);
  }

  /**
   * Returns the validator instance associated with dataDefinitionInst.  The supplied
   * dataDefinitionInst must be an instance of the super class.
   *
   * @static
   * @param {AbstractDataDefinition} dataDefinitionInst - Instance of the validator super class
   * @param {Object} data - Data being validated
   * @returns
   * @memberof DefinitionRegistry
   */
  static getValidatorInstance(dataDefinitionInst, data) {
    const dataDefName = dataDefinitionInst.constructor.name;

    assert(dataDefinitionInst.typeKey !== null);
    assert(dataDefinitionInst.typeName === null);
    assert(data instanceof Object);
    assert(!Array.isArray(data));
    assert(dataDefName in DefinitionRegistry.BASE_MAPPING_TO_IMPLEMENTATION);

    if (!dataDefinitionInst.typeKey in data) {
      throw new ValidationError(null, `data type name can not be found at ".${dataDefinitionInst.typeKey}"`, data);
    }

    const validatorMapping = DefinitionRegistry.BASE_MAPPING_TO_IMPLEMENTATION[dataDefName];
    const dataTypeName = data[dataDefinitionInst.typeKey];
    if (!(dataTypeName in validatorMapping)) {
      throw new ValidationError(null, `object is not a known subtype of ${dataDefName}`, data);
    }

    return validatorMapping[dataTypeName];
  }
}



module.exports = DefinitionRegistry;
