var tests = function($) {

  jqUnit.test("validation with an empty schema and empty object", function() {
    var result = JSONSchema.validate({}, {});
    jqUnit.ok(result.valid, "should return valid for empty objects");
    jqUnit.isSet(result.errors, [], "should not return an errors array");
  });

  jqUnit.test("validation with an empty schema and an arbitrary object", function() {
    var result = JSONSchema.validate({name:"foo"}, {});
    jqUnit.ok(result.valid, "should return valid");
    jqUnit.isSet(result.errors, [], "should not return an errors array");
  });

  jqUnit.test("validation with a description", function() {
    var result = JSONSchema.validate({description:"description"}, {"description":"foo"});
    jqUnit.ok(result.valid, "should ignore the description");
  });

  jqUnit.test("object type validation", function() {
    var result = JSONSchema.validate({}, {"type":"object"});
    jqUnit.ok(result.valid, "should understand empty objects");
    jqUnit.isSet(result.errors, [], "should return an empty errors array for valid objects");
    result = JSONSchema.validate({name:"foo"}, {"type":"object"});
    jqUnit.ok(result.valid, "should understand basic objects");
    jqUnit.isSet(result.errors, [], "should return an empty errors array for valid objects");

    // Not sure this should be the case, but documenting with a test for now...
    result = JSONSchema.validate([1,2,3], {"type":"object"});
    jqUnit.ok(result.valid, "should treat arrays as objects");
    jqUnit.isSet(result.errors, [], "should return an empty errors array for valid arrays");

    result = JSONSchema.validate({foo:{bar:"nested"}}, {"type":"object"});
    jqUnit.ok(result.valid, "should understand nested objects");
    jqUnit.isSet(result.errors, [], "should return an empty errors array for valid objects");
    result = JSONSchema.validate("hello", {"type":"object"});
    jqUnit.ok(result.valid == false, "should mark strings as invalid");
    jqUnit.equals(result.errors.length, 1, "should return the correct number of errors for invalid objects");
    jqUnit.equals(result.errors[0].path, "$", "should list the root object as invalid when it is a string");
    jqUnit.ok(result.errors[0].message.length > 0, "should return a message for an error");
  });

  jqUnit.test("array type validation", function() {
    var result = JSONSchema.validate([], {"type":"array"});
    jqUnit.ok(result.valid, "should understand empty arrays");
    jqUnit.isSet(result.errors, [], "should return an empty errors array for valid objects");
    result = JSONSchema.validate([1,2,3], {"type":"array"});
    jqUnit.ok(result.valid, "should understand basic arrays");
    jqUnit.isSet(result.errors, [], "should return an empty errors array");
    result = JSONSchema.validate({foo:"bar"}, {"type":"array"});
    jqUnit.ok(result.valid == false, "should mark objects as invalid");
    jqUnit.equals(result.errors.length, 1, "should return the correct number of errors for invalid objects");
    jqUnit.equals(result.errors[0].path, "$", "should mark the root element as invalid when it is an object");
    jqUnit.ok(result.errors[0].message.length > 0, "should return a message for an error");
  });

}(jQuery);
