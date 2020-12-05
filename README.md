# EnsureData
Provides a toolkit for validation of user defined messages, suitable for both client and server side use.

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
