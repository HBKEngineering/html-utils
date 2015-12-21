define(['backbone', 'jquery', 'underscore', 'html-utils'], function(Backbone, $, _, HtmlUtils){	
	var testModel;

	before(function(){ 
		testModel = new Backbone.Model({
			title: 'test title'
		});		
	});

	describe('#constructor', function(){
		it('exists', function(){
			assert.isObject(HtmlUtils, 'HtmlUtils exists.');
		});
	});
	//nameFor Tests
	describe('#nameFor', function(){
		it('should return a String', function(){

			var sName = HtmlUtils.nameFor("Name", "PrefixName");

			assert.typeOf(sName, 'string');
		});
		it('should be equal to a string passed in if its 1 parameter with no special characters', function(){

			var sName = HtmlUtils.nameFor("OtherName");

			assert.equal(sName, 'OtherName');
		});
		it('should be equal to a string concatenate two strings if two are passed in', function(){

			var sName = HtmlUtils.nameFor("OtherName", "Prefix");

			assert.equal(sName, 'Prefix.OtherName');
		});
		it('should strip special characters from a string ', function(){

			var sName = HtmlUtils.nameFor("Prefix/../f");

			assert.equal(sName, 'Prefixf');
		});
		it('should return an array name from the first parameter with a concatenated prefix  ', function(){

			var sName = HtmlUtils.nameFor("name[]", "prefix");

			assert.equal(sName, 'prefix.name[]');
		});
		it('should not insert a period if the first parameter starts with a bracket', function(){
			var sName = HtmlUtils.nameFor('[0]', 'prefix');

			assert.equal(sName, 'prefix[0]');
		});
	});
	//idFor Tests
	describe('#idFor', function(){
		it('should return a String', function(){

			var sId = HtmlUtils.idFor("Name", "PrefixName");

			assert.typeOf(sId, 'string');
		});
		it('should be equal to a string passed in if its 1 parameter with no special characters', function(){

			var sId = HtmlUtils.idFor("OtherName");

			assert.equal(sId, 'OtherName');
		});
		it('should yield a concatenation of two strings with an underscore if two are passed in', function(){

			var sId = HtmlUtils.idFor("OtherName", "Prefix");

			assert.equal(sId, 'Prefix_OtherName');
		});
		it('should strip special characters from a string', function(){

			var sId = HtmlUtils.idFor("Prefix/../f");

			assert.equal(sId, 'Prefixf');
		});
		it('should return an array name from the first parameter with a concatenated prefix  ', function(){

			var sId = HtmlUtils.idFor("name[]", "prefix");

			assert.equal(sId, 'prefix_name__');
		});
		it('should not insert an underscore if the first parameter starts with a bracket', function(){
			var sName = HtmlUtils.idFor('[0]', 'prefix');

			assert.equal(sName, 'prefix_0_');
		});
	});
	//valueFor Tests
	describe('#valueFor', function(){
		it('should return a String value of the backbone attribute', function(){

			var sValue = HtmlUtils.valueFor(testModel, "title");

			assert.equal(sValue, "test title");
		});
		it('should return a String value of the attribute', function(){
			var obj = {
				title: "test title"
			};
			var sValue = HtmlUtils.valueFor(obj, "title");

			assert.equal(sValue, "test title");
		});

		it('should return a String value of the attribute', function(){
			var obj = {
				name: 's', 
				obj: { 
					prop: 'f'
				},
				arr: [
					't',
					'u']
			};
			var sValue = HtmlUtils.valueFor(obj, "obj.prop");

			assert.equal(sValue, "f");
		});
		it('should return a String value of the attribute', function(){
			var obj = {
				name: 's', 
				obj: { 
					prop: 'f'
				},
				arr: [
					't',
					'u']
			};
			var sValue = HtmlUtils.valueFor(obj, "arr[0]");

			assert.equal(sValue, "t");
		});

	});

	describe('#mergeAttributes', function(){
		it('should return a concatenation of attributes objects passed to it', function(){

			var attr1 = {
				'id': 'someId',
				'class': 'special red',
				'name': 'flower',
				'aria-hidden': 'false'
			};
			var attr2 = {
				'class': 'alt flavored',
				'aria-form': 'text'
			};

			var oValue = HtmlUtils.mergeAttributes(attr1, attr2);
			var oExpectedResult = {
				'id': 'someId',
				'class': 'special red alt flavored',
				'name': 'flower',
				'aria-hidden': 'false',
				'aria-form': 'text'
			};

			assert.deepEqual(oValue, oExpectedResult);
		});
	});


	describe('#mergeClasses', function(){
		it('should return a concatenation of the class names passed to it', function(){

			var attr1 = 'class1';
			var attr2 = 'class2';
			var sValue = HtmlUtils.mergeClasses(attr1, attr2);
			var oExpectedResult = "class1 class2"
			assert.equal(sValue, oExpectedResult);
		});
	});

	describe('#bind', function(){
		it('should set the model field and input value attribute to match when first called', function(){
			var model = new Backbone.Model({
				value: "test"
			});
			var el = $('<input value="" type = "text"></input>');
			var attribute = "value";

			HtmlUtils.bind(model, el, attribute);

			assert.equal(model.get("value"), el.val());

		});

		it('should set the model field and input value attribute to match when when the input value is changed', function(){
			var model = new Backbone.Model({
				value: "test"
			});
			var el = $('<input value="" type = "text"></input>');
			var attribute = "value";

			HtmlUtils.bind(model, el, attribute);

			el.val('test2').change();

			assert.equal(model.get("value"), "test2");
		});

		it('should set the model field and input value attribute to match when when the model value is changed', function(){
			var model = new Backbone.Model({
				value: "test"
			});
			var el = $('<input value="" type = "text"></input>');
			var attribute = "value";

			HtmlUtils.bind(model, el, attribute);

			model.set("value", 'test2');

			assert.equal(el.val(), "test2");

		});

	});

	describe('#bindAll', function(){
		var container, scoped, model;

		beforeEach(function(){
			container = $("<form></form>");
			container.append('<input type="text" class="form-name" name="Name"></input>');
			container.append('<input type="text" class="form-description" name="Description"></input>');
			container.append('<input type="checkbox" class="form-files" name="hasFiles"></input>');
			container.append('<input type="text" class="form-parent" name="parent"></input>');

			scoped = function(selector){
				return container.find(selector);
			}

			model = new Backbone.Model({
				Name: "test", Description: "test2", hasFiles: true, parent: 'someid'
			});
		});


		xit('should call bind for each mapping of attributes and selectors', function(){
			var spy = sinon.spy(HtmlUtils, 'bind');

			function matcher(selector){
				return sinon.match(function(value){
					var result = scoped(selector)[0];

					if(value[0] == result){
						return true;
					} else {
						return false;
					}
				}, selector);
			}

			HtmlUtils.bindAll(model, scoped, {
				'.form-name': 'Name', 
				'.form-description': 'Description',
				'.form-files': 'hasFiles',
				'.form-parent': 'parent'
			});

			assert(spy.calledWith(model, matcher('.form-name'), 'Name'));
			assert(spy.calledWith(model, matcher('.form-description'), 'Description'));
			assert(spy.calledWith(model, matcher('.form-files'), 'hasFiles'));
			assert(spy.calledWith(model, matcher('.form-parent'), 'parent'));
			spy.restore();
		});
	});
});