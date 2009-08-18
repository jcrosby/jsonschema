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
  });
  
  // This test suite is a work in progress.

}(jQuery);
