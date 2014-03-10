/**
 * @author  Kelt <kelt@dockins.org>
 * @license  MIT
 */
var global;
(function($)
{
	/**
	 * Register a switcheroo on an element. This will
	 * use this as the base selector and search out and
	 * find all children elements (even dynamically created
	 * ones) for the toggleSelector, offSelector and onSelector
	 *
	 */
	$.fn.switcheroo = function(options)
	{
		var settings = $.extend( {}, $.fn.switcheroo.defaults, options );

		return this.each(function (index, selected)
		{
			var element = $(selected);
			var isRegistered = element.attr(settings.selectors.registered);
			var parentInitializer = element.closest('[' + settings.selector('registered') + ']');

			if (isRegistered === "true" || isRegistered === true)
			{
				return;
			}

			if (parentInitializer.length > 0)
			{
				console.warn('not registering', element, 'because it has registered parent', parentInitializer);
				return;
			}

			element.attr(settings.selectors.registered, true);
			element.settings = settings;
			element.setHandler = $.fn.switcheroo.setHandler;

			// register events in a specific order
			for (var index in settings.eventOrdering)
			{
				var name = settings.eventOrdering[index];
				element.setHandler(name, settings.handlers[name]);
			}
		});
	};

	/**
	 * Sets a handler in our handler registry. This allows
	 * us to do custom handlers for switch events if we
	 * choose to do so. Else we just fallback to the normal
	 * stuff, like toggle, toggleOn and toggleOff.
	 *
	 */
	$.fn.switcheroo.setHandler = function(name, handler)
	{
		var register = typeof this.settings !== 'undefined'
		var settings = (register) ? this.settings : $.fn.switcheroo.defaults;

		if (typeof settings.selectors[name] === 'undefined')
		{
			settings.selectors[name] = settings.selectors.toggle + '-' + name;
		}

		settings.handlers[name] = handler;

		if (!register)
		{
			settings.eventOrdering.push(name);
			return;
		}

		this.on(settings.eventTypes, '[' + settings.selector(name) + ']', handleEvent(name, settings));
	};

	/**
	 * Defaults for this plugin
	 *
	 */
global=	$.fn.switcheroo.defaults =
	{
		// order of event calls
		eventOrdering 	: ['revert', 'toggle', 'off', 'on', 'prev', 'next'],

		// this is the default DOM element we will bind to if initialization is not overriden
		initDefault		: 'body',

		// these classes are toggled back and forth
		toggleClasses	: ['', 'active'],

		// all event types we will listen for globally on registered DOM element
		eventTypes		: 'click dblclick change focusin focusout mousedown mouseup mouseover mousemove mouseenter mouseout dragstart drag dragenter dragleave dragover drop dragend keypress keyup',

		// default event types for specific element types
		eventType 		: {
			text 		: "focusin focusout",
			textarea 	: "focusin focusout",
			radio 		: "change",
			checkbox 	: "change",
			select 		: "change",
			option 		: "change",
			others 		: "click"
		},

		// this allows us to map specific events with specific handlers
		eventOverrides	: {
			'focusin'	: 'on',
			'focusout'	: 'off',
			'mouseenter': 'on',
			'mouseout'	: 'off'
		},

		// this is how we know which elements to select from the DOM
		selectors		: {
			toggle			: "data-switch",
			toggleClass 	: "data-switch-class",
			originalClass 	: "data-switch-original-class",
			to 				: "data-switch-to",
			eventType 		: "data-switch-event",
			init 			: "data-switch-init",
			registered 		: "data-switch-registered",
			noloop			: "data-switch-no-loop"
		},

		// handlers are how we handle our toggle event
		handlers: {
			toggle: function(toggle)
		 	{
		 		if (toggle.classes.to)
		 		{
			 		return toggle.selected.toggleClass(toggle.classes.to);
		 		}

		 		toggle.selected.toggleClass(toggle.classes.last);
		 		toggle.selected.toggleClass(toggle.classes.first, !toggle.selected.hasClass(toggle.classes.last));
		 	},

			on: function(toggle)
			{
				var to = toggle.classes.to ? toggle.classes.to : toggle.classes.last;

				toggle.selected.removeClass(toggle.classes.all);
				toggle.selected.addClass(to);
			},

			off: function(toggle)
			{
				var to = toggle.classes.to ? toggle.classes.to : toggle.classes.all;
				
				toggle.selected.removeClass(to)
				toggle.selected.addClass(toggle.classes.first);
			},

			prev: function(toggle)
			{
				toggle.classes.prev(toggle.selected);
			},

			next: function(toggle)
			{
				toggle.classes.next(toggle.selected);
			},

			revert: function(toggle)
			{
				toggle.classes.revert(toggle.selected);
			}
		},

		// shortcut method to get the selector name
		selector 		: getSelector,

		// allows us to override the handler for specific cases, i.e. checkbox/textarea
		handlerOverride	: getEventHandlerName
	};

	/**
	 * Self initializing plugin but can be stopped
	 * by using [data-switch-init] on the page somewhere
	 *
	 */
	$(window).load(function()
	{
		var initSelector = $.fn.switcheroo.defaults.selectors.init;

		if ($('['+initSelector+']').length == 0)
		{
			return $($.fn.switcheroo.defaults.initDefault).switcheroo();
		}

		$('['+initSelector+']').each(function(index, initializer)
		{
			initializer = $(initializer);

			var element = initializer.attr(initSelector);

			if (element === "false" || element === false)
			{
				return;
			}

			if (trim(element) != '')
			{
				return $(element).switcheroo();
			}

			return initializer.switcheroo();
		});
	});

	/**
	 * Make sure that the event type matches what
	 * we should trigger on the current element
	 *
	 */
	function isMatchingEventType(event, settings)
	{
		var eventType = getEventType($(event.currentTarget), settings);

		return trim(eventType.split(' ')).indexOf(event.type) != -1;
	}

	/**
	 * Returns a closure for handling the event. This
	 * takes into account the settings as well. Filters
	 * out only event types that should fire the handler
	 * for this element.
	 *
	 * For example, we don't want the mouseover
	 * event triggering our handler when only the
	 * click event should.
	 */
	function handleEvent(eventType, settings)
	{
		return function(event)
		{
			if (isMatchingEventType(event, settings))
			{
				onEvent(event, eventType, settings);
			}
		}
	}

	/**
	 * Handle different event types that come through. If we've made
	 * it this far then we should process the event because it
	 * was a matching event type.
	 *
	 */
	function onEvent(event, handlerName, settings)
	{
		var toggle = {
			element: $(event.currentTarget),
			event: event,
			settings: settings,
			handlerName: handlerName
		};


		toggle.selected = getElementToChange(toggle);
		toggle.handler = getEventHandler(toggle);
		toggle.classes = getToggleClasses(toggle);

		// we handle select boxes a little differently
		if (getElementType(toggle.element) == 'select')
		{
			return onSelectEvent(toggle);
		}

		return toggle.handler(toggle);
	}

	/**
	 * We handle the select box event here. We do this because
	 * we can set overrides on each <option> inside of the select
	 * and those don't actually get triggered by events so we have
	 * to handle the event triggering ourselves. This allows us
	 * to have multiple handlers on an option element if we need
	 * to override the main select's handlers.
	 *
	 */
	function onSelectEvent(toggle)
	{
		var select = toggle.element;
		var option = select.find(':selected');

		if (option === 'undefined')
		{
			return toggle.handler(toggle);
		}

		// override the [data-switch-class] on the option level
		if (hasToggleClasses(option, toggle.handlerName, toggle.settings))
		{
			toggle.element = option;
			toggle.classes = getToggleClasses(toggle);
			toggle.element = select;
		}

		// override the [data-switch-to] on the option level
		if (option.attr(toggle.settings.selectors.to) !== 'undefined')
		{
			toggle.classes.to = option.attr(toggle.settings.selectors.to);
		}

		var handlers = getOptionHandlers(toggle, option);

		if (handlers.length == 0)
		{
			return toggle.handler(toggle);
		}

		// run through all the handlers we setup
		for (var index in handlers)
		{
			var current = handlers[index];
			current.handler(current);
		}
	}

	/**
	 * We can have multiple handlers on a selectbox
	 * so let's use those. Anytime we override any handler
	 * on an option we don't execute the parent handlers on
	 * the selectbox. This keeps the events from overlapping.
	 *
	 * This is by design as I think it will keep it simpler.
	 *
	 */
	function getOptionHandlers(toggle, option)
	{
		var handlers = [];
		var settings = toggle.settings;

		for (var index in settings.eventOrdering)
		{
			var handlerName = settings.eventOrdering[index];
			var selector = settings.selector(handlerName);

			if (typeof option.attr(selector) !== 'undefined')
			{
				var optionToggle = $.extend({}, toggle);
				optionToggle.handlerName = handlerName;
 				optionToggle.handler = getEventHandler(optionToggle);

 				// see if selected element should be overriden
 				var elementToChange = getElementToChange(optionToggle);
 				if (elementToChange.length > 0)
 				{
	 				optionToggle.selected = elementToChange;
 				}

				handlers.push(optionToggle);
			}
		}

		return handlers;
	}

	/**
	 * Finds the element we should be changing. This depends on the
	 * handlerDefaultName selector and can be overridden in the DOM
	 * on a per element basis especially when dealing with select
	 * option elements. An element can also select itself to change
	 * if there are no params to the [data-switch] binding on the
	 * element.
	 *
	 */
	function getElementToChange(toggle)
	{
		var settings = toggle.settings;
		var element = toggle.element;
		var selector = element.attr(settings.selectors[toggle.handlerName]);
		var elementType = getElementType(element);

		// overrides for select option
		if (elementType == 'select')
		{
			var optionSelector = element.find(':selected').attr(settings.selectors[toggle.handlerName]);

			if (typeof optionSelector !== 'undefined' && optionSelector != '')
			{
				return element.closest('[' + settings.selectors.registered + ']').find(optionSelector);
			}
		}

		// element selector
		if (selector != '')
		{
			return element.closest('[' + settings.selectors.registered + ']').find(selector);
		}

		// return yourself to be the element to change
		return element;
	}

	/**
	 * Returns the handler we should use for this toggle event
	 * instance. It can be overridden because of the event type.
	 *
	 */
	function getEventHandler(toggle)
	{
		var settings = toggle.settings;
		var handlerName = toggle.handlerName;
		var event = toggle.event;

		handlerName = settings.handlerOverride(event, handlerName);
		
		if (typeof settings.handlers[handlerName] === 'undefined')
		{
			console.warn('Could not find handler for ' + handlerName, toggle.element, settings);
		}

		return settings.handlers[handlerName];
	}

	/**
	 * Get the classes by categories. Some categories are
	 *
	 * 	1. all 			- all classes in our toggleClasses array
	 * 	2. active 		- the classes that are active
	 * 	3. inactive		- the classes that are inactive
	 * 	4. toggleTo 	- the class we can change to (if overrride)
	 * 	5. first		- the first class in array
	 * 	6. last			- the last class in array
	 * 	7. prev(step=1)	- the class before current class
	 * 	8. next(step=1)	- the class after current class
	 * 	9. list 		- (has active, inactive, all arrays)
	 * 10. original		- the classes before we started touching things
	 *
	 * This also takes into consideration an overrides made
	 * on the element [data-switch-class] and select options
	 *
	 * This allows users to set their own classes for an element
	 * if they don't want to just toggle between '' and 'active'.
	 *
	 */
	function getToggleClasses(toggle)
	{
		var classes = {};
		var element = $(toggle.element);
		var settings = toggle.settings;
		var handlerName = toggle.handlerName;
		var toggleClasses = getToggleClassesList(element, handlerName, settings);

		var query = getToggleClassesQuery(toggle.selected, toggleClasses, settings, element);

		// here are a bunch of categories we can use in our
		// toggle handler later if we want...
		classes.all = toggleClasses.join(' ');
		classes.active = query.active.join(' ');
		classes.inactive = query.inactive.join(' ');

		classes.to = (typeof settings.selectors.to !== 'undefined') ? element.attr(settings.selectors.to) : false;
		classes.first = toggleClasses[0];
		classes.last = toggleClasses[toggleClasses.length - 1];

		// this only really works when you have no duplicate
		// classes in your toggleClasses array...
		classes.prev = query.prev;
		classes.next = query.next;
		classes.original = query.original;

		// reverts element(s) to original state
		classes.revert = function (selected)
		{
			$(selected).each(function(index, item)
			{
				var element = $(item);
				element.removeClass();
				element.addClass(classes.original(item));
			});
		};

		// in case we want to use the original arrays
		// in our handler later... who knows... *shrugs*
		classes.list = {
			active: query.active,
			inactive: query.inactive,
			all: toggleClasses
		};

		return classes;
	}

	/**
	 * Returns a query about all the classes that are active/inactive
	 * as well as the previous and next. We do this all together for
	 * performance so we don't have to loop 4 different times over the
	 * same array.
	 *
	 */
	function getToggleClassesQuery(selected, toggleClasses, settings, element)
	{
		var query = { original: '', active: [], inactive: [], previous: '', next: '' };

		query.original = getOriginalClassNameFunction(selected, settings);
		query.prev = getPreviousToggleClassFunction(element, className, toggleClasses, settings);
		query.next = getNextToggleClassFunction(element, className, toggleClasses, settings);

		for (var index in toggleClasses)
		{
			var className = toggleClasses[index];

			if (hasFullClassName(selected, className))
			{
				query.active.push(className);
			}
			else
			{
				query.inactive.push(className);
			}
		}

		return query;
	}

	/**
	 * Get the original classname on an element
	 * as a function because we can have multiple
	 * elements with different original class names.
	 *
	 */
	function getOriginalClassNameFunction(selected, settings)
	{
		selected.each(function(index, item)
		{
			var element = $(item);
			var original = element.attr(settings.selectors.originalClass);

			if (typeof original === 'undefined')
			{
				original = element.attr('class');
				element.attr(settings.selectors.originalClass, original);
			}
		});

		return function(item)
		{
			return $(item).attr(settings.selectors.originalClass);
		};
	}

	/**
	 * Returns the previous class name function so handlers
	 * can get the previous class.
	Function *
	 */
	function getPreviousToggleClassFunction(element, className, toggleClasses, settings)
	{
		return function(items, step)
		{
			step = (typeof step !== 'undefined') ? step : 1;

			$(items).each(function(index, item)
			{
				var selected = $(item);
				var current = getCurrentToggleClassIndex(selected, toggleClasses);
				var previous = (current == -1) ? 0 - step : current - step;
				previous = mod(previous, toggleClasses.length);

				if (typeof element.attr(settings.selectors.noloop) !== 'undefined' && current <= 0)
				{
					previous = 0;
				}

				if (current >= 0)
				{
					selected.removeClass(toggleClasses[current]);
				}

				selected.addClass(toggleClasses[previous]);
			});
		};
	}

	/**
	 * Returns the next class name function so handlers
	 * can get the next class in the loop.
	 *
	 */
	function getNextToggleClassFunction(element, className, toggleClasses, settings)
	{
		return function(items, step)
		{
			step = (typeof step !== 'undefined') ? step : 1;

			$(items).each(function(index, item)
			{
				var selected = $(item);
				var current = getCurrentToggleClassIndex(selected, toggleClasses);
				var next = mod(current + step, toggleClasses.length);

				if (typeof element.attr(settings.selectors.noloop) !== 'undefined' && current == toggleClasses.length - 1)
				{
					next = toggleClasses.length - 1;
				}

				if (current >= 0)
				{
					selected.removeClass(toggleClasses[current]);
				}

				selected.addClass(toggleClasses[next]);				
			});
		};
	}

	/**
	 * Returns the current index of our toggle class
	 * for the given element. Needs to be a singular element.
	 * 
	 */
	function getCurrentToggleClassIndex(element, toggleClasses)
	{
		for (var index in toggleClasses)
		{
			if (hasFullClassName(element, toggleClasses[index]))
			{
				return parseInt(index);
			}
		}

		return -1;
	}

	/**
	 * This is here because say you have the $element
	 * 		<div class="animated"></div>
	 * then
	 * 		$element.hasClass('animated cool') // true
	 *
	 * So we will go through each class and ensure the entire
	 * class is part of the element not just some of it.
	 *
	 */
	function hasFullClassName(element, className, allClasses)
	{
		var classNames = className.split(' ');

		for (var index in classNames)
		{
			if (!element.hasClass(classNames[index]))
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Javascript modulus function returns negative numbers
	 * for negative moduli, and even though this is correct
	 * we want to constrict the range from 0 to n - 1, so 
	 * we need to use this function instead of just %.
	 * 
	 */
	function mod(x, n)
	{
		var r = x % n;
		return (r < 0) ? r += n : r;
	}

	/**
	 * Trim a string's whitespace. We use this because IE8 doesn't
	 * have the String.prototype.trim fucntion. If the string is an
	 * array then we will loop through and trim each element.
	 *
	 */
	function trim(string)
	{
		if ($.isArray(string))
		{
			for (var index in string)
			{
				string[index] = trim(string[index]);
			}

			return string;
		}

		return string.replace(/^\s+|\s+$/g, '');
	}

	/**
	 * Here we get the array listing of classes that we can toggle
	 * through.
	 *
	 */
	function getToggleClassesList(element, handlerName, settings)
	{
		var override = hasToggleClasses(element, handlerName, settings);

		if (override === false)
		{
			return settings.toggleClasses;
		}

		if (override.substr(0, 1) == '[' && override.substr(override.length - 1, 1) == ']')
		{
			override = trim(override.substr(1, override.length - 2).split(','));
		}
		else
		{
			override = ['', override];
		}

		return override;
	}

	/**
	 * See if this element has [data-switch-class] override.
	 *
	 */
	function hasToggleClasses(element, handlerName, settings)
	{
		var override = element.attr(settings.selectors.toggleClass);

		if (typeof override === 'undefined' || trim(override) === '')
		{
			return false;
		}

		return trim(override);
	}

	/**
	 * Gets the element type for us
	 *
	 * a, select, checkbox, radio, etc
	 */
	function getElementType(element)
	{
		var tagName = element.prop('tagName').toLowerCase();

		if (tagName == 'input' && typeof element.attr('type') !== 'undefined')
		{
			return element.attr('type');
		}

		return tagName;
	}

	/**
	 * This is the event type on the object. It defaults to
	 * just click but can be overridden based on the element
	 * type we are using or if the element has a binding to
	 * [data-switch-event] attribute.
	 *
	 */
	function getEventType(element, settings)
	{
		var eventType = element.attr(settings.selectors.eventType);

		if (typeof eventType !== 'undefined')
		{
			return eventType;
		}

		var elementType = getElementType(element);

		if (typeof settings.eventType[elementType] !== 'undefined')
		{
			return settings.eventType[elementType];
		}

		return settings.eventType.others;
	}

	/**
	 * Get the selector for this key
	 *
	 */
	function getSelector(key)
	{
		return this.selectors[key];
	}

	/**
	 * We can override the handler here for specific elements.
	 *
	 * We loop through eventOverrides to see if there are any
	 * that match this event.type and then we also check if this
	 * element is a checkbox then we want to toggle on/off to
	 * match the is(:checked) property.
	 *
	 */
	function getEventHandlerName(event, handlerName)
	{
		for (var index in this.eventOverrides)
		{
			var eventOverride = this.eventOverrides[index];
			if (handlerName == 'toggle' && event.type == index)
			{
				return eventOverride;
			}
		}

		var element = $(event.currentTarget);
		var elementType = getElementType(element);

		// override checkboxes to see if they are selected
		if (handlerName == 'toggle' && elementType == 'checkbox')
		{
			return element.is(':checked') ? 'on' : 'off';
		}

		return handlerName;
	}

})(jQuery);