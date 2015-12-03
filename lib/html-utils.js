/**
 * Utility class for various HTML operations.
 * @module html-utils
 */
(function(root, factory){
	/* jshint -W117, undef:false */
	if(typeof module === 'object' && /* jshint -W117 */module.exports/* jshint +W117 */) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		/* jshint -W117 */
		module.exports = factory(require('underscore'), require('jquery'));
		/* jshint +W117 */
	} else if(typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define('html-utils', ['underscore', 'jquery'], factory);
	} else {
		// Browser globals (root is window)
		root.HtmlUtils = factory(root._, root.$);
	}
	/* jshint +W117, undef:true */
}(this, function(_, $){
	function sterilizeNameString(value){
		value = value || '';

		return value.replace(/^\s+|\s+$/g, '').replace(/^\.+|\.+$/g, '').replace(/[^\w\[\]]/g, '');
	}

	var HtmlUtils = function(){
	};

	HtmlUtils.prototype = {
		/**
		 * Generates a markup-friendly field name.
		 * @param  {string} fieldName The field name to transform.
		 * @param  {string} prefix    A prefix to place on the field name.
		 * @return {string}           A sanitized field name.
		 * @example
		 * HtmlUtils.nameFor("OtherName");
		 * //returns "OtherName"
		 * HtmlUtils.nameFor("OtherName","Prefix");
		 * //returns 'Prefix.OtherName'
		 * HtmlUtils.nameFor("Prefix/../f");//strips special characters
		 * //returns 'Prefixf'
		 * HtmlUtilsHtmlUtils.nameFor("name[]", "prefix");// return an array name from the first parameter with a concatenated prefix
		 * //returns 'prefix.name[]'
		 */
		nameFor: function(fieldName, prefix){
			prefix = sterilizeNameString(prefix);
			fieldName = sterilizeNameString(fieldName);

			if(fieldName && fieldName.indexOf('[') === 0){
				return prefix + fieldName;
			} else {
				return (prefix ? prefix + '.' : '') + fieldName;
			}
		},

		/**
		 * Generates a markup-friendly element ID.
		 * @param  {string} fieldName The field name to transform.
		 * @param  {string} prefix    A prefix to place on the field name.
		 * @return {string}           A sanitized field name.
		 * @example
		 * HtmlUtils.idFor("OtherName");//equal to a string passed in if its 1 parameter with no special characters'
		 * //returns 'OtherName'
		 * HtmlUtils.idFor("OtherName","Prefix");//should be equal to a string concatenate two strings if two are passed in
		 * //returns 'Prefix.OtherName'
		 * HtmlUtils.idFor("Prefix/../f");//should strip special characters from a string and replace them with underscores'
		 * //returns 'Prefix____f'
		 * HtmlUtilsHtmlUtils.idFor("name[]", "prefix");// should return an array name from the first parameter with a concatenated prefix
		 * //returns 'prefixname[]'
		 */
		idFor: function(fieldName, prefix){
			return this.nameFor(fieldName, prefix).replace(/[^A-Za-z0-9_\-\:]/g, '_');
		},

		/**
		 * Retrieves the value of the field from a model.
		 * @param  {object} model     The model in question. May be either a backbone model or a vanilla object.
		 * @param  {string} fieldName The field to retrieve. Dot notation is supported.
		 * @return {mixed}           The property value.
		 * @example
		 * HtmlUtils.valueFor(testModel, "title");//should return a String value of the backbone attribute
		 * //returns "test title"
		 * var obj = {title : "test title"};
		 * var sValue = HtmlUtils.valueFor(obj, "title");//should return a String value of the attribute',
		 * //returns  "test title"
		 * 	var obj = {
			 *	name: 's',
			 *	obj:{
			 *		prop: 'f'
			 *	},
			 *	arr:[
			 *		't',
			 *		'u']};
		 * HtmlUtils.valueFor(obj, "obj.prop");//should return a String value of the attribute',
		 * //returns "f"
		 * 	var obj = {
			 *	name: 's',
			 *	obj:{
			 *		prop: 'f'
			 *	},
			 *	arr:[
			 *		't',
			 *		'u']};
		 * HtmlUtils.valueFor(obj, "arr[0]");//should return a String value of the attribute',
		 * //returns "t"
		 */
		valueFor: function(model, fieldName){
			var nextDot = fieldName.indexOf('.');
			var nextBracket = fieldName.indexOf('[');
			var nextClosingBracket = fieldName.indexOf(']');

			function getAttribute(model, attr){
				if(model.get){
					return model.get(attr);
				} else {
					return model[attr];
				}
			}

			if(model){
				var property,
					newFieldName;

				if(nextDot != -1){
					property = fieldName.substring(0, nextDot);
					newFieldName = fieldName.substring(nextDot + 1);

					return this.valueFor(getAttribute(model, property.replace(/^\[|\]$/g, '')), newFieldName);
				} else if(nextBracket != -1){
					property = fieldName.substring(0, nextBracket);
					newFieldName = fieldName.substring(nextClosingBracket + 1);
					var propertyKey = fieldName.substring(nextBracket + 1, nextClosingBracket);

					return this.valueFor(getAttribute(model, property.replace(/^\[|\]]$/g, ''))[propertyKey], newFieldName);
				} else {
					if(fieldName){
						return getAttribute(model, fieldName.replace(/^\[|\]$/g, ''));
					} else {
						return model;
					}
				}
			} else {
				return null;
			}
		},

		/**
		 * Merges maps of HTML attributes together.
		 * @param {...object} ... The maps to merge.
		 * @return {object} The resulting attribute map.
		 * @example
		 * require(['hbkcore/utils/HtmlUtils'], function(HtmlUtils){
			 * 		HtmlUtils.mergeAttributes({
			 * 			'id': 'someId',
			 * 			'class': 'special red',
			 * 			'name': 'flower',
			 * 			'aria-hidden': 'false'
			 * 		}, {
			 * 			'class': 'alt flavored',
			 * 			'aria-form': 'text'
			 * 		});
			 * 		//returns
			 * 		{
			 * 			'id': 'someId',
			 * 			'class': 'special red alt flavored',
			 * 			'name': 'flower',
			 * 			'aria-hidden': 'false',
			 * 			'aria-form': 'text'
			 * 		}
			 * });
		 */
		mergeAttributes: function(){
			var attrs = {};
			var classes = [];

			_.each(arguments, function(attrList){
				if(attrList){
					if(attrList['class']){
						classes.push(attrList['class']);
						delete attrList['class'];
					}

					attrs = _.extend(attrs, attrList);
				}
			});

			if(classes.length){
				attrs['class'] = this.mergeClasses.apply(this, classes);
			}

			return attrs;
		},

		/**
		 * Merges sets of HTML classes together.
		 * @param {...mixed} ... Any number of arrays or strings containing classes to combine.
		 * @return {String} The concatenated set of all input classes.
		 * @example
		 * require(['hbkcore/utils/HtmlUtils'], function(HtmlUtils){
			 * 		HtmlUtils.mergeClasses(['red', 'activated'], 'alt', 'special normal');
			 * 		//returns "red activated alt special normal"
			 * });
		 */
		mergeClasses: function(){
			var classes = [];

			_.each(arguments, function(classList){
				if(classList){
					if(_.isString(classList)){
						classList = classList.match(/\S+/g);
					}

					classes = _.union(classes, classList);
				}
			});

			return classes.join(' ');
		},

		/**
		 * Binds a model and an HTML input tag together such that changes to the model's field value are reflected in the tag and changes in the tag are reflected in the model's field.
		 * @param  {object} model     The model to bind.
		 * @param  {jquery} el        The element to bind.
		 * @param  {string} attribute The attribute to bind.
		 * @example
		 * //  should set the model field and input value attribute to match when first called
		 * var model = new Backbone.Model({value: "test"});
		 * var el = $('<input value="" type = "text"></input>');
		 * var attribute = "value";
		 *
		 * HtmlUtils.bind(model, el, attribute);
		 * assert.equal(model.get("value"), el.val());
		 *
		 * //should set the model field and input value attribute to match when when the input value is changed'
		 *	var model = new Backbone.Model({value: "test"});
		 *	var el = $('<input value="" type = "text"></input>');
		 *	var attribute = "value";
		 *
		 *	HtmlUtils.bind(model, el, attribute);
		 *	el.val('test2').change();
		 *	assert.equal(model.get("value"), "test2");
		 *
		 * //should set the model field and input value attribute to match when when the model value is changed'
		 * var model = new Backbone.Model({value: "test"});
		 * var el = $('<input value="" type = "text"></input>');
		 * var attribute = "value";
		 *
		 * HtmlUtils.bind(model, el, attribute);
		 *
		 * model.set("value", 'test2');
		 *
		 * assert.equal(el.val(), "test2");
		 */
		bind: function(model, el, attribute){
			var listen = true;

			function updateElementValue(){
				if($(el).attr('type') == 'checkbox'){
					$(el)[0].checked = !!model.get('attribute');
				} else {
					$(el).val(model.get(attribute));
				}
			}

			updateElementValue();
			$(el).on('change keyup', function(){
				listen = false;

				if($(el).attr('type') == 'checkbox'){
					model.set(attribute, $(el)[0].checked);
				} else {
					model.set(attribute, $(el).val());
				}

				listen = true;
			});
			model.on('change:' + attribute, function(){
				if(listen){
					updateElementValue();
				}
			});
		},

		/**
		 * Binds a selection of input tags to a model using `bind`.
		 * @param  {object} model    The model to bind.
		 * @param  {jquery} $        A reference to jquery.
		 * @param  {object} bindings A mapping from selector to model attribute.
		 * @example
		 *
		 *var container, scoped, model;
		 * container = $("<form></form>");
		 * container.append('<input type="text" class="form-name" name="Name"></input>');
		 * container.append('<input type="text" class="form-description" name="Description"></input>');
		 * container.append('<input type="checkbox" class="form-files" name="hasFiles"></input>');
		 * container.append('<input type="text" class="form-parent" name="parent"></input>');
		 *
		 * scoped = function(selector){
		     * 	return container.find(selector);
		     * }
		 *
		 *  model = new Backbone.Model({Name: "test", Description: "test2", hasFiles: true, parent: 'someid'});
		 *
		 * HtmlUtils.bindAll(model, scoped, {
			 * 	'.form-name': 'Name',
			 * 	'.form-description': 'Description',
			 * 	'.form-files': 'hasFiles',
			 * 	'.form-parent': 'parent'
			 * });
		 */
		bindAll: function(model, $, bindings){
			var self = this;

			_.each(bindings, function(attribute, selector){
				self.bind(model, $(selector), attribute);
			});
		}
	};

	return new HtmlUtils();
}));
