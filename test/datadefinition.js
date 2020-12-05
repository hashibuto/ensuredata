const AbstractDataDefinition = require('../src/AbstractDataDefinition');
const StringType = require('../src/types/StringType');
const IntType = require('../src/types/IntType');
const ArrayType = require('../src/types/ArrayType');
const EnumType = require('../src/types/EnumType');
const { ValidationError } = require('../src');

class PetEnumDef extends EnumType {
  static COLLECTION = [
    'dog',
    'cat',
    'bird',
  ];

  get collection() {
    return PetEnumDef.COLLECTION;
  }
}

class PetDef extends AbstractDataDefinition {
  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    name: new StringType().maxLength(25),
    type: new PetEnumDef(),
  }

  get definition() {
    return PetDef.DEFINITION;
  }
}

class PersonDef extends AbstractDataDefinition {
  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    firstName: new StringType().maxLength(25),
    lastName: new StringType().maxLength(25),
    pet: new PetDef().nullable(),
  }

  get definition() {
    return PersonDef.DEFINITION;
  }
}

class GroupDef extends AbstractDataDefinition {
  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    name: new StringType('unnamed').maxLength(25),
    members: new ArrayType().maxLength(5).ofType(new PersonDef())
  }

  get definition() {
    return GroupDef.DEFINITION;
  }
}

const pet1Valid = {
  name: 'Fido',
  type: 'dog',
};

const pet2Valid = {
  name: 'Fifi',
  type: 'cat',
};

const pet3Invalid = {
  name: 'Peppy',
  type: 'rabbit',
};

const person1Valid = {
  firstName: 'Rufus',
  lastName: 'Rutherford',
  pet: pet1Valid,
};

const person2Valid = {
  firstName: 'Donovan',
  lastName: 'Dallas',
  pet: pet2Valid,
}
const person3Invalid = {
  firstName: 'Ronald',
  lastName: 'Reganzi',
  pet: pet3Invalid,
}

const group1Valid = {
  name: 'TheseGuys',
  members: [
    person1Valid,
    person2Valid,
  ]
}

const group2Invalid = {
  name: 'These guys with a really long group name',
  members: [
    person1Valid,
    person2Valid,
  ]
}

const group3Invalid = {
  name: 'ThoseGuys',
  members: [
    person3Invalid,
    person1Valid,
  ]
}

describe("Test validation of user defined data", () => {

  it('Nested objects must validate properly', () => {
    const group = new GroupDef().test(group1Valid, true);
  });

  it('Nested objects must fail validation when invalid (1)', () => {
    try {
      const group = new GroupDef().test(group2Invalid, true);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw new Error('Must fail on invalid data');
  });

  it('Nested objects must fail validation when invalid (2)', () => {
    try {
      const group = new GroupDef().test(group3Invalid, true);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw new Error('Must fail on invalid data');
  });

});
