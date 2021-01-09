const StringType = require('../src/types/StringType');
const FormDefinition = require('../src/FormDefinition');
const assert = require('assert');

const formDef = new FormDefinition({
  firstName: new StringType('hello').minLength(2),
  lastName: new StringType().minLength(2),
});

describe("Test FormDefinition", () => {
  it("Must initialize a form", () => {
    const myForm = formDef.initialize();

    assert('firstName' in myForm);
    assert('lastName' in myForm);
    assert(myForm.firstName === 'hello');
    assert(myForm.lastName === '');
  });

  it("Must validate a form", () => {
    const myForm = {
      firstName: "some",
      lastName: "n",
    };

    const errors = formDef.getErrors(myForm);
    assert(!('firstName' in errors));
    assert('lastName' in errors);
  });
});
