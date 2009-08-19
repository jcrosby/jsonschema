var tests = function($) {

  shouldHaveEmptyErrors = function(result) {
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
    jqUnit.ok(result.valid, "should return valid for empty objects");
    shouldHaveEmptyErrors(result);
  });

  jqUnit.test("validation with an empty schema and an arbitrary object", function() {
    var result = JSONSchema.validate({name:"foo"}, {});
    jqUnit.ok(result.valid, "should return valid");
    shouldHaveEmptyErrors(result);
  });

  jqUnit.test("validation with a description", function() {
    var result = JSONSchema.validate({description:"description"}, {"description":"foo"});
    jqUnit.ok(result.valid, "should ignore the description");
    shouldHaveEmptyErrors(result);
  });

  jqUnit.test("object type validation", function() {
    var schema = {"type":"object"};
    var result = JSONSchema.validate({}, schema);
    jqUnit.ok(result.valid, "should understand empty objects");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate({name:"foo"}, schema);
    jqUnit.ok(result.valid, "should understand basic objects");
    shouldHaveEmptyErrors(result);

    // Not sure this should be the case, but documenting with a test for now...
    result = JSONSchema.validate([1,2,3], schema);
    jqUnit.ok(result.valid, "should treat arrays as objects");
    shouldHaveEmptyErrors(result);
    
    result = JSONSchema.validate({foo:{bar:"nested"}}, schema);
    jqUnit.ok(result.valid, "should understand nested objects");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate("hello", schema);
    shouldHaveOneError(result, "should mark strings as invalid", "$");
  });

  jqUnit.test("array type validation", function() {
    var schema = {"type":"array"};
    var result = JSONSchema.validate([], schema);
    jqUnit.ok(result.valid, "should understand empty arrays");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate([1,2,3], schema);
    jqUnit.ok(result.valid, "should understand basic arrays");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate({foo:"bar"}, schema);
    shouldHaveOneError(result, "should mark objects as invalid", "$");
  });

  jqUnit.test("integer property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"integer", "minimum":2, "maximum":125}}};
    var result = JSONSchema.validate({foo:3}, schema);
    jqUnit.ok(result.valid, "should accept an object with an integer property that conforms to the schema");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate({foo:"bar"}, schema);
    shouldHaveOneError(result, "should reject an an object with a string that does not conform to the schema", "$.foo");
    result = JSONSchema.validate({foo:1}, schema);
    shouldHaveOneError(result, "should reject an integer that is less then the specified minimum", "$.foo");
    result = JSONSchema.validate({foo:2}, schema);
    jqUnit.ok(result.valid, "should accept an integer property equal to the specified minimum");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate({foo:125}, schema);
    jqUnit.ok(result.valid, "should accept an integer property equal to the specified maximum");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate({foo:126}, schema);
    shouldHaveOneError(result, "should reject an integer that is greater than the specified maximum", "$.foo");
  });

  jqUnit.test("string property validation", function() {
    var schema = {type:"object", properties:{"foo": {"type":"string", "minLength":2, "maxLength":5, "pattern":/\w+/}}};
    var result = JSONSchema.validate({foo:"bar"}, schema);
    jqUnit.ok(result.valid, "should accept an object with a string property that conforms to the schema");
    shouldHaveEmptyErrors(result);
    result = JSONSchema.validate({foo:3}, schema);
    shouldHaveOneError(result, "should reject an object with an integer that does not conform to the schema", "$.foo");
    result = JSONSchema.validate({foo:"x"}, schema);
    shouldHaveOneError(result, "should reject a string of length less than minLength", "$.foo");
    result = JSONSchema.validate({foo:"hello"}, schema);
    jqUnit.ok(result.valid, "should accept a string of length equal to maxLength");
    jqUnit.isSet(result.errors, [], "should return an empty errors array for valid objects");
    result = JSONSchema.validate({foo:"helloo"}, schema);
    shouldHaveOneError(result, "should reject a string of length greater than maxLength", "$.foo");
    result = JSONSchema.validate({foo:"1hello"}, schema);
    shouldHaveOneError(result, "should reject a string that does not match the given expression", "$.foo");
  });

}(jQuery);
