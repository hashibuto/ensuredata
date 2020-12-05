const AbstractDataDefinition = require('../src/AbstractDataDefinition');
const IntType = require("../src/types/IntType");
const FloatType = require("../src/types/FloatType");
const EnumType = require("../src/types/EnumType");
const ArrayType = require('../src/types/ArrayType');
const DefinitionRegistry = require('../src/DefinitionRegistry');
const assert = require('assert');

class WeaponTypeEnum extends EnumType {
  static LASER_GUN = 'LASER_GUN';
  static CONVENTIONAL_GUN = 'CONVENTIONAL_GUN';
  static MELEE = 'MELEE';

  static COLLECTION = [
    WeaponTypeEnum.LASER_GUN,
    WeaponTypeEnum.CONVENTIONAL_GUN,
    WeaponTypeEnum.MELEE,
  ];

  get collection() {
    return WeaponTypeEnum.COLLECTION;
  }
}

class RobotTypeEnum extends EnumType {

  static BATTLE_BOT = 'BATTLE_BOT';
  static CLEANING_BOT = 'CLEANING_BOT';
  static MECHANIC_BOT = 'MECHANIC_BOT';

  static COLLECTION = [
    RobotTypeEnum.BATTLE_BOT,
    RobotTypeEnum.CLEANING_BOT,
    RobotTypeEnum.MECHANIC_BOT,
  ];

  get collection() {
    return RobotTypeEnum.COLLECTION;
  }

}

class RobotDef extends AbstractDataDefinition {

  static DEFINITION = {
    legs: new IntType().from(2),
    arms: new IntType().from(1),
    type: new RobotTypeEnum(),
    strength: new IntType().from(1).to(10),
    armor: new IntType().from(1).to(10),
  }

  get definition() {
    return RobotDef.DEFINITION;
  }

  get typeKey() {
    return 'type';
  }
}

// Register the base class
DefinitionRegistry.register(RobotDef);

class BattleBotDef extends RobotDef {

  static DEFINITION = {
    weapons: new ArrayType().ofType(new WeaponTypeEnum()).noDuplicates(),
  }

  get definition() {
    return {
      ...super.definition,
      ...BattleBotDef.DEFINITION,
    }
  }

  get typeName() {
    return RobotTypeEnum.BATTLE_BOT;
  }

}

// Register the subclass
DefinitionRegistry.register(BattleBotDef);

class MechanicBotDef extends RobotDef {

  static DEFINITION = {
    jobPercent: new FloatType().to(1),
  }

  get definition() {
    return {
      ...super.definition,
      ...MechanicBotDef.DEFINITION,
    }
  }

  get typeName() {
    return RobotTypeEnum.MECHANIC_BOT;
  }

}

// Register the subclass
DefinitionRegistry.register(MechanicBotDef);

describe("Test definition inheritance and concrete type determination", () => {
  it('Must be able to discern the correct implementation type', () => {
    const obj = {
      legs: 2,
      arms: 4,
      type: RobotTypeEnum.BATTLE_BOT,
      strength: 7,
      armor: 3,
      weapons: [WeaponTypeEnum.LASER_GUN, WeaponTypeEnum.MELEE],
    };

    // Perform a generic object test which will internally choose the appropriate validator
    // since the obj.type will determine the specific validator subclass to use.
    const validated = new RobotDef().test(obj);
    assert(validated.weapons !== undefined);
    assert(validated.weapons.length === obj.weapons.length);
  })
});
