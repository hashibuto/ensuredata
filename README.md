# EnsureData
Provides a toolkit for validation of user defined messages, suitable for both client and server side use.  EnsureData was originally developed to provide robust data validation for our web services framework [Layer8](https://www.npmjs.com/layer8) as part of the library, but it became apparent that it was useful for client side validation as well, and thus was moved to its own library.

## Philosophy
Data validation is of the upmost importance, when it comes to securing web services.  EnsureData provides a simple but robust data definition mechanism which ensures that only compliant data ever gets processed.

## Data validation types
EnsureData implements several basic data types and some extended types as well.  The developer is also free to extend any of these types in order to create more custom types with more sophisticated validation criteria.

### Basic types

- `ArrayType` - Validates array data
- `EnumType` - Validates enumerable data
- `FloatType` - Validates any numeric data
- `IntType` - Validates integer data
- `StringType` - Validates string data

### Extended types

- `EmailType` - Validates email data
- `PasswordType` - Validates password data

## Defining validators
Each validator being defined must be instantiated and to the instance, any validation rules attributed.  Below is a simple example of a `StringType` validator:

```
  const sampleValue = 'Hello long world';
  const validator = new StringType().minLength(5).maxLength(10);

  const retValue = validator.test(sampleValue);
```

In the example above, the validator will evaluate and return any string value with a length between 5 and 10 characters.  Because `sampleValue` is 16 characters long, it will fail validation and a `ValidationError` will be thrown.

### Default values
Each validator's constructor takes an optional default value.  When a value is not present, the default will be used.  If no default is provided, then a `ValidationError` will be thrown.

```
  const myObject = {};
  const validator = new StringType('Untitled');
  const title = validator.test(myObject.title);
```
In the above example, `title` will be set to the default of `"Untitled"`, since title is not available on the object in question, and thus will be `undefined`.

### Common validation logic
The `AbstractType` exposes some basic validation rules, including the default value defined in the constructor.  All rules can be chained together since each invocation returns the object instance.

- `.onlyAfterCreate()` - Validator does not apply during object creation (this use case will become more apparent when we delve into object validation).
- `.nullable()` - Allows data to be set to `null`.
- `.customValidate(validator)` - Receives a function in the form of `f(v)` which can perform any custom validation logic, returning the target value or throwing an exception.  This is useful for adding arbitrary rules to a standard validator.

### Validating arrays
The `ArrayType` validator is used to validate arrays.  The following rules are available:

- `.minLength(x)` - Ensures a minimum of `x` elements are present on the array.  By default, empty arrays are not permitted.  If an empty array is permissible, `.minLength(0)` must be specified.
- `.maxLength(x)` - Ensures at most, `x` elements are present on the array.
- `.ofType(typeInstance)` - Ensures that all elements of the array are of `typeInstance`.  `typeInstance` is an instance of any validator, for instance `new IntType().to(10)` would ensure that all elements are integers no greater than 10.
- `.noDuplicates()` - Ensures that no element in the array is repeated more than once.  This only applies to immutable primitives such as numbers and strings.  Complex objects or arrays will not be subject to this validation rule.

### Validating enums
The `EnumType` validator is used to validate enumerable data.  Only string enumerations are supported.  The `EnumType` must be subclassed in order to implement it.  Consider this example implementation:

```
  class VolumeEnumDef extends EnumType {

    static LOW = 'LOW';
    static MEDIUM = 'MEDIUM';
    static HIGH = 'HIGH';

    static COLLECTION = [
      VolumeEnumDef.LOW,
      VolumeEnumDef.MEDIUM,
      VolumeEnumDef.HIGH,
    ];

    get collection() {
      return VolumeEnumDef.COLLECTION;
    }

  }

  const validator = new VolumeEnumDef(VolumeDefEnum.MEDIUM);
  const obj = {};
  const enum = validator.test(obj.volume);
```

In the example above, the `get collection()` property getter returns a static array of enumerations.  The test value `obj.volume` is `undefined`, so in this case, the default of `VolumneDefEnum.MEDIUM` will be applied.  However if the supplied value is not a member of the collection, a `ValidationError` will be thrown.

### Validating floats
The `FloatType` validator is used to validate floating point data.  Since javascript does not have a specific type for floating point values, this validator will permit any valid number.  The following rules are available:

- `.from(x)` - Ensures that only values starting from `x` will be permitted.
- `.to(x)` - Ensures that only values up to and including `x` will be permitted.

### Validating integers
The `IntType` validator is used to validate integer data.  Only integer numbers will be permitted.  The following rules are available:

- `.from(x)` - Ensures that only values starting from `x` will be permitted.
- `.to(x)` - Ensures that only values up to and including `x` will be permitted.

### Validating strings
The `StringType` validator is used to validate strings.  The following rules are available:

- `.minLength(x)` - Ensures a minimum of length of `x` characters.  By default, empty strings are not permitted.  If an empty string is permissible, `.minLength(0)` must be specified.
- `.maxLength(x)` - Ensures a maximum string length of `x` characters.
- `.trim()` - Ensures that string is trimmed of leading and trailing whitespace prior to enforcement of other validation rules.  This means that an untrimmed string will be stripped of whitespace (trailing and leading) by the validator.  A trimmed verison of the string will also be returned by the `.test` method.

## Validating form data
Forms can be defined and initialized as follows:
```
  const { FormDefinition, StringType } = require('ensuredata');

  const formDef = new FormDefinition({
    firstName: new StringType().minLength(3),
    lastName: new StringType().minLength(3).maxLength(10),
    favoriteColor = new StringType('orange'),
  });

  const myForm = formDef.initialize();
```

In the example above, the key defines the form field, and the value defines a validator.  The default
value for each validator represents the initial value in the form.  If a default is not specified, the
empty value for a given data type will be used.  In the case of `StringType`, it's simply an empty string.

Forms are validated like this:
```
  const errors = formDef.getErrors(myForm);
  const isValid = (Object.keys(errors).length === 0);
```
Errors is an object and will contain a key/value pair for each form item that fails validation.  The value will be the failure message.  In order to avoid processing the form twice, there is no explicit call that returns a `boolean` type.

## User defined object validation
This is where EnsureData really shines.  On the server side in particular, it is essential to be able to validate data passed from the client, whether it be entities for creation/modification or any other type of data.  User defined data is defined using the `AbstractDataDefinition` class.  The following simple example will illustrate validator for validating a job entity.

```
  class JobDef extends AbstractDataDefinition {

    static DEFINITION = {
      id: new IntType().from(1).onlyAfterCreate(),
      name: new StringType().minLength(3).maxLength(25).trim(),
      salary: new FloatType(),
      numPositions: IntType(1).to(100),
    }

    get definition() {
      return JobDef.DEFINITION;
    }

  }
```

This validator, when applied to an object, will ensure the presence of each defined key (or substitute with a default if unavailable), and the specified data type, within the constraints defined within each validator.  In the case of the `id` key, the `onlyAfterCreate()` classifier instructs that the `id` key should only be tested/included after object creation.  Below would be an example usage:

Consider a simple a RESTful web service handler that has a `PUT` and a `POST` handler.  The data would be validated as follows:

```
  class JobHandler {

    static JOB_VALIDATOR = new JobDef();

    post(obj) {
      const validatedJob = JobHandler.JOB_VALIDATOR.test(obj, true);
      ...
    }

    put(obj) {
      const validatedJob = JobHandler.JOB_VALIDATOR.test(obj, false);
      ...
    }
  }
```

In the `post` method, the validator's `.test` is invoked with a second argument (for `isCreate` as `true`).  That means this is an entity create request, and we should not consider or include any keys which have `.onlyAfterCreate()` as part of the validator.

In the `put` method, we invoke the same `.test` method with the second argument as `false`, indicating that it's not a create operation, and all validators should be considered.  This allows objects being created to omit certain data which is only available after creation, but enforces that it is present during other operations such as update.

## Nested user defined data
The user defined data validators are not limited to single objects with flat key/value pairs.  Objects can be deeply nested and the entire tree validated with a single call.  Consider this example of groups of people:

```
  const {
    AbstractDataDefinition,
    StringType,
    IntType,
    ArrayType,
  } = require('ensuredata');

  class PersonDef extends AbstractDataDefinition {

    static DEFINITION = {
      firstName: new StringType().maxLength(25).trim(),
      lastName: new StringType().maxLength(25).trim(),
      age: new IntType(),
    }

    get definition() {
      return PersonDef.DEFINITION;
    }

  }
```

Above, we've defined a validator for a person, which has 3 attributes, a first name, last name, and age.

```
  class GroupDef extends AbstractDataDefinition {

    static DEFINITION = {
      name: new StringType().minLength(3).maxLength(25).trim(),
      members: new ArrayType().maxLength(10).ofType(new PersonDef()),
    }

    get definition() {
      return GroupDef.DEFINITION;
    }

  }
```
Next, we've defined a validator for a group, which has a name, and contains a number of members, each of which must be a person (validated by the `PersonDef` validator).

```
  class SeminarDef extends AbstractDataDefinition {

    static DEFINITION = {
      groups: new ArrayType().ofType(new GroupDef),
    }

    get definition() {
      return SeminarDef.DEFINITION;
    }

  }
```

Finally we declare one more definition, which will be used to validate a collection of groups.  Below is how a sample piece of data would look, and how validation would be invoked:

```
  const sample = {
    groups: [
      {
        name: "Red Team",
        members: [
          {
            firstName: "Sandy",
            lastName: "Mitchell",
            age: 42
          },
          {
            firstName: "Arthur",
            lastName: "Fasbender",
            age: 49
          },
          {
            firstName: "Roger",
            lastName: "Dalton",
            age: 37
          }
        ]
      },
      {
        name: "Blue Team",
        members: {
          {
            firstName: "Wendy",
            lastName: "Feng",
            age: 38
          },
          {
            firstName: "Rick",
            lastName: "Roll",
            age: 29
          },
          {
            firstName: "Lester",
            lastName: "Holiday",
            age: 57
          }
        }
      }
    ]
  }

  try {
    const validatedSample = new SeminarDef().test(sample);
  } except(e) {
    if (e instanceof ValidationError) {
      console.error("Oops, validation failed!)
    }

    throw e;
  }

```

The `SeminarDef`'s test method, will iterate its own definition and invoke the appropriate validator at each key, or recursively apply another definition's test method.  The end result will be either a fully validated object (`validatedSample` above), or a thrown `ValidationError`.

## Inheritance in validators
Inheritance in validators goes beyond simple class extension.  In particular, a common use case may be to validate an object which derives from a common type, but the the specific type is not known until the object is validated.  In this case, it's essential to be able to declare a validator, which is the base class, and have the validation logic handed off to the specific implementation after it has been determined.  EnsureData solves this inheritance problem through class registration, which tracks what subclasses are available for a given base class, and of which a specific class is chosen based on the message type.

The `AbstractDataDefinition` class has 2 special propery getters for inheritance.  They are `typeKey` and `typeName`.

`typeKey`, when overridden, returns a key on a given object, which is used to determine the type of object.  The type itself must belong to an enumeration (subclass of `EnumType`).  A base class validator must implement its own `typeKey`, and objects to be validated must bear that key/value pair.  For instance, if `typeKey === 'type'`, then the target object must look something like this:

```
{
  ...,
  type: "MY_OBJECT_TYPE",
}
```

`typeName` is the property which must be overridden on the concrete class.  This returns the object type which is represented by the class.  Using the example above, `typeName` would return `"MY_OBJECT_TYPE"` on one concrete implementation of the base class.  The base class however, must return `null` for `typeName`.

Below is a simple example using a single base class and 2 concrete subclasses:

```
  const {
    AbstractDataDefinition,
    EnumType,
    IntType,
    ArrayType,
    DefinitionRegistry,
  } = require('ensuredata');

  class ShapeEnumDef extends EnumType {

    static RECTANGLE = 'RECTANGLE';
    static CIRCLE = 'CIRCLE';

    static COLLECTION = [
      ShapeEnumDef.RECTANGLE,
      ShapeEnumDef.CIRCLE,
    ];

    get collection() {
      return ShapeEnumDef.COLLECTION;
    }

  }

  class ShapeDef extends AbstractDataDefinition {

    static DEFINITION = {
      centerX: new IntType(),
      centerY: new IntType(),
      type: new ShapeEnumDef(),
    }

    get definition() {
      return ShapeDef.DEFINITION;
    }

    get typeKey() {
      return 'type';
    }

  }

  DefinitionRegistry.register(ShapeDef);

  class CircleDef extends ShapeDef {

    static DEFINITION = {
      radius: new IntType().from(1),
    }

    get definition() {
      return {
        ...super.definition,
        ...CircleDef.DEFINITION,
      }
    }

    get typeName() {
      return ShapeEnumDef.CIRCLE;
    }

  }

  DefinitionRegistry.register(CircleDef);

  class RectangleDef extends ShapeDef {

    static DEFINITION = {
      width: new IntType().from(1),
      height: new IntType().from(1),
    }

    get definition() {
      return {
        ...super.definition,
        ...RectangleDef.DEFINITION,
      }
    }

    get typeName() {
      return ShapeEnumDef.RECTANGLE;
    }

  }

  DefinitionRegistry.register(RectangleDef);
```

You will notice above that we've defined 3 classes.  The base class is `ShapeDef` which implements the `typeKey` property.  We also notice that `ShapeDef`'s definition has a key called `'type'`, which points to an enum validator.

Next you'll notice that there are 2 shapes which extend `ShapeDef`.  Each of them implement their own `typeName`, which identifies them using names from the enum `ShapeEnumDef`.

We also register each of the three classes involved, using `DefinitionRegistry.register()`.  This helps to establish the relationship between the classes so that we can validate data as follows:
```
const sample = {
  shapes: [
    {
      type: "CIRCLE",
      centerX: 10,
      centerY: 11,
      radius: 15
    },
    {
      type: "RECTANGLE",
      centerX: 22,
      centerY: -1,
      width: 10,
      height: 20
    }
  ]
}

class ObjValidatorDef {

  static DEFINITION = {
    shapes: new ArrayType().ofType(new ShapeDef())
  }

  get definition() {
    return ObjValidatorDef.DEFINITION;
  }

}

const validatedObj = new ObjValidatorDef().test(sample);
```

In the example above, we did not need to explicitly list all the validators involved in validating any of the shapes in the array.  It was enough to use the `ShapeDef` in the `ArrayType` validator.  Internally the `ShapeDef` would pick based on the `type` key, which concrete validator to use to carry out the rest of the validation.  Note: we did not need to register `ObjValidatorDef`.  Only validators which employ inheritance during validation need to be registered.
