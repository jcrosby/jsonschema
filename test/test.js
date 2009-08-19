var tests = function($) {

  shouldBeValid = function(result, message) {
    jqUnit.ok(result.valid, message);
    jqUnit.isSet(result.errors, [], "should return an empty errors array for valid objects");
  };

  shouldHaveOneError = function(result, message, path) {
    jqUnit.ok(result.valid == false, message);
    jqUnit.equals(result.errors.length, 1, "should return the correct number of errors for invalid objects");
    jqUnit.ok(result.errors[0].message.length > 0, "should return a message for an error");
    jqUnit.equals(result.errors[0].path, path, "should indicate the path where the error was found");
  };

  jqUnit.test("validation with an empty schema and empty object", function() {
    var result = JSONSchema.validate({}, {});
    shouldBeValid(result, "should return valid for empty objects");
  });

  jqUnit.test("validation with an empty schema and an arbitrary object", function() {
    var result = JSONSchema.validate({name:"foo"}, {});
    shouldBeValid(result, "should return valid");
  });

  jqUnit.test("validation with a description", function() {
    var result = JSONSchema.validate({description:"description"}, {"description":"foo"});
    shouldBeValid(result, "should ignore the description");
  });

  jqUnit.test("object type validation", function() {
    var schema = {"type":"object"};
    var result = JSONSchema.validate({}, schema);
    shouldBeValid(result, "should understand empty objects");
    result = JSONSchema.validate({name:"foo"}, schema);
    shouldBeValid(result, "should understand basic objects");

    // Not sure this should be the case, but documenting with a test for now...
    result = JSONSchema.validate([1,2,3], schema);
    shouldBeValid(result, "should treat arrays as objects");

    result = JSONSchema.validate({foo:{bar:"nested"}}, schema);
    shouldBeValid(result, "should understand nested objects");
    result = JSONSchema.validate("hello", schema);
    shouldHaveOneError(result, "should mark strings as invalid", "$");
  });

  jqUnit.test("array type validation", function() {
    var schema = {"type":"array"};
    var result = JSONSchema.validate([], schema);
    shouldBeValid(result, "should understand empty arrays");
    result = JSONSchema.validate([1,2,3], schema);
    shouldBeValid(result, "should understand basic arrays");
    result = JSONSchema.validate({foo:"bar"}, schema);
    shouldHaveOneError(result, "should mark objects as invalid", "$");
  });

  jqUnit.test("integer property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"integer", "minimum":2, "maximum":125}}};
    var result = JSONSchema.validate({foo:3}, schema);
    shouldBeValid(result, "should accept an object with an integer property that conforms to the schema");
    result = JSONSchema.validate({foo:"bar"}, schema);
    shouldHaveOneError(result, "should reject an an object with a string that does not conform to the schema", "$.foo");
    result = JSONSchema.validate({foo:1}, schema);
    shouldHaveOneError(result, "should reject an integer that is less then the specified minimum", "$.foo");
    result = JSONSchema.validate({foo:2}, schema);
    shouldBeValid(result, "should accept an integer property equal to the specified minimum");
    result = JSONSchema.validate({foo:125}, schema);
    shouldBeValid(result, "should accept an integer property equal to the specified maximum");
    result = JSONSchema.validate({foo:126}, schema);
    shouldHaveOneError(result, "should reject an integer that is greater than the specified maximum", "$.foo");
  });

  jqUnit.test("string property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"string", "minLength":2, "maxLength":5, "pattern":/\w+/}}};
    var result = JSONSchema.validate({foo:"bar"}, schema);
    shouldBeValid(result, "should accept an object with a string property that conforms to the schema");
    result = JSONSchema.validate({foo:3}, schema);
    shouldHaveOneError(result, "should reject an object with an integer that does not conform to the schema", "$.foo");
    result = JSONSchema.validate({foo:"x"}, schema);
    shouldHaveOneError(result, "should reject a string of length less than minLength", "$.foo");
    result = JSONSchema.validate({foo:"hello"}, schema);
    shouldBeValid(result, "should accept a string of length equal to maxLength");
    result = JSONSchema.validate({foo:"helloo"}, schema);
    shouldHaveOneError(result, "should reject a string of length greater than maxLength", "$.foo");
    result = JSONSchema.validate({foo:"1hello"}, schema);
    shouldHaveOneError(result, "should reject a string that does not match the given expression", "$.foo");
  });

  jqUnit.test("number property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"number", "minimum":2.0, "maximum":2.5, "maxDecimal":3}}};
    var result = JSONSchema.validate({foo:2}, schema);
    shouldBeValid(result, "should accept an integer (a number subset)");
    result = JSONSchema.validate({foo:2.0}, schema);
    shouldBeValid(result, "should accept a floating point number equal to the specified minimum");
    result = JSONSchema.validate({foo:"bar"}, schema);
    shouldHaveOneError(result, "should reject an object with a string that does not conform to the schema", "$.foo");
    result = JSONSchema.validate({foo:1.999}, schema);
    shouldHaveOneError(result, "should reject a floating point number less than the specified minimum", "$.foo");
    result = JSONSchema.validate({foo:2.501}, schema);
    shouldHaveOneError(result, "should reject a floating point number greater than the specified maximum", "$.foo");
    result = JSONSchema.validate({foo:2.4001}, schema);
    shouldHaveOneError(result, "should reject a floating point number with greater precision than the specified maxDecimal", "$.foo");
  });

  jqUnit.test("boolean property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"boolean"}}};
    var result = JSONSchema.validate({foo:true}, schema);
    shouldBeValid(result, "should accept an object with a true boolean property that conforms to the schema");
    result = JSONSchema.validate({foo:false}, schema);
    shouldBeValid(result, "should accept an object with a false boolean property that conforms to the schema");
    result = JSONSchema.validate({foo:"true"}, schema);
    shouldHaveOneError(result, "should reject a string containing a true boolean value", "$.foo");
    result = JSONSchema.validate({foo:"false"}, schema);
    shouldHaveOneError(result, "should reject a string containing a false boolean value", "$.foo");
    result = JSONSchema.validate({foo:3}, schema);
    shouldHaveOneError(result, "should reject an integer property that does not conform to the schema", "$.foo");
  });

  jqUnit.test("null property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"null"}}};
    var result = JSONSchema.validate({foo:null}, schema);
    shouldBeValid(result, "should accept an object with a null property that conforms to the schema");
    result = JSONSchema.validate({foo:"null"}, schema);
    shouldHaveOneError(result, "should reject a string containing the word null", "$.foo");
    result = JSONSchema.validate({foo:3}, schema);
    shouldHaveOneError(result, "should reject an integer property that does not conform to the schema", "$.foo");
  });

  jqUnit.test("any property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"any"}}};
    var result = JSONSchema.validate({foo:null}, schema);
    shouldBeValid(result, "should accept a null property value");
    result = JSONSchema.validate({foo:3}, schema);
    shouldBeValid(result, "should accept an integer property value");
    result = JSONSchema.validate({foo:3.0}, schema);
    shouldBeValid(result, "should accept a number property value");
    result = JSONSchema.validate({foo:"hello"}, schema);
    shouldBeValid(result, "should accept a string property value");
    result = JSONSchema.validate({foo:true}, schema);
    shouldBeValid(result, "should accept a boolean property value");
    result = JSONSchema.validate({foo:[1,2,3]}, schema);
    shouldBeValid(result, "should accept an array property value");
    result = JSONSchema.validate({foo:{bar:"baz"}}, schema);
    shouldBeValid(result, "should accept an object property value");
  });

  jqUnit.test("mixed type validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":["string", "number"]}}};
    var result = JSONSchema.validate({foo:"hello"}, schema);
    shouldBeValid(result, "should accept a string property that is a member of a union type");
    result = JSONSchema.validate({foo:3.0}, schema);
    shouldBeValid(result, "should accept a number property that is a member of a union type");
    result = JSONSchema.validate({foo:true}, schema);
    shouldHaveOneError(result, "should reject a type that is not a member of the union type schema", "$.foo");
  });

  jqUnit.test("nested object schema validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"object", properties:{"bar":{"type":"array"}}}}};
    var result = JSONSchema.validate({foo:{bar:[1,2,3]}}, schema);
    shouldBeValid(result, "should accept a nested object structure that conforms to the schema");
    result = JSONSchema.validate({foo:{bar:true}}, schema);
    shouldHaveOneError(result, "should reject a nested object that does not conform to the schema", "$.foo.bar");
  });

}(jQuery);
