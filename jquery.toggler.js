/**
 * @author  Kelt <kelt@dockins.org>
 * @license  MIT
 */
(function($)
{
	/**
	 * Keep up with the elements we ahve registered because we
	 * don't want to re-register them again.
	 *
	 */
	var registered = [];

	/**
	 * Handle different event types
	 *
	 */
	function onEvent(event, handlerDefaultName, settings)
	{
		var element = $(event.currentTarget);
		var elementType = getElementType(element);
		var selector = element.attr(settings.selectors[handlerDefaultName]);
		var selected = element;

		if (selector != '')
		{
			selected = element.closest('[' + settings.selectors.registered + ']').find(selector);
		}

		var handlerName = getHandlerName(element, selected, event, handlerDefaultName, settings);
		var handler = settings.handlers[handlerName];
		var toggleClasses = getToggleClasses(element, selected, settings);

		// we treat select's a little differently because
		// they can have options which have toggler-on/off
		if (elementType != "select")
		{
			return handler(selected, toggleClasses, event, settings);
		}

		return onEventWithSelect(element, selected, toggleClasses, event, settings, handler);
	}

	/**
	 * Handles the event with a select box. Since we can use
	 * children options to toggle active/inactive states this
	 * can get messy logically so it makes more sense to have it
	 * in it's own seperate function.
	 *
	 */
	function onEventWithSelect(element, selected, toggleClasses, event, settings, handler)
	{
		var selectedOption = element.find(':selected');
		var toggle = selectedOption.attr(settings.selectors.toggle);
		var toggleOn = selectedOption.attr(settings.selectors.toggleOn);
		var toggleOff = selectedOption.attr(settings.selectors.toggleOff);

		// make sure there aren't any overrides for toggle classes
		toggleClasses = getToggleClassesForOption(selectedOption, toggleClasses, settings);

		// make sure there aren't any overrides for option handler
		var toggleHandler = getHandlerForOption(selectedOption, selected, event, handler, settings);

		// make sure that the element that will be toggled is not overridden
		var toggleSelector = getSelectedElementForOption(selectedOption, selected, settings.selectors.toggle);

		// if this element has no toggle overrides then just handle the select box...
		if (typeof toggle === 'undefined' && typeof toggleOff === 'undefined' && typeof toggleOn === 'undefined')
		{
			return toggleHandler(selected, toggleClasses, event, settings);
		}

		// toggle handler
		if (typeof toggle !== 'undefined')
		{
			toggleHandler(toggleSelector, toggleClasses, event, settings);
		}

		// toggleOff
		if (typeof toggleOff !== 'undefined')
		{
			toggleSelector = getSelectedElementForOption(selectedOption, selected, settings.selectors.toggleOff);
			settings.handlers.toggleOff(toggleSelector, toggleClasses, event, settings);
		}

		if (typeof toggleOn !== 'undefined')
		{
			toggleSelector = getSelectedElementForOption(selectedOption, selected, settings.selectors.toggleOn);
			settings.handlers.toggleOn(toggleSelector, toggleClasses, event, settings);
		}
	}

	/**
	 * Make sure that the event type matches what
	 * we should trigger on the current element
	 *
	 */
	function isMatchingEventType(event, settings)
	{
		var element = $(event.currentTarget);
		var eventType = element.attr(settings.selectors.eventType);

		if (typeof eventType === 'undefined')
		{
			eventType = getEventType(element, settings);
		}

		eventType = eventType.split(' ');

		for (var index in eventType)
		{
			if (trim(eventType[index])  == event.type)
			{
				return true;
			}
		}

		return false;
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
	 * An event handler can be overridden on the attribute or it can be
	 * different slightly for when the event.type is focusin or focusout
	 * or if the element type is a radio or checkbox. This functions gets
	 * our event handler
	 *
	 */
	function getHandlerName(element, selected, event, handlerDefaultName, settings)
	{
		var handlerName = element.attr(settings.selectors.handler);
		var elementType = getElementType(element);

		// overrides the default handler from element's attribute
		if (typeof handlerName !== 'undefined')
		{
			if (typeof settings.handlers[handlerName] === 'undefined')
			{
				console.warn('Could not find handler for ' + handlerName, element);
			}

			return handlerName;
		}

		// use default since an override was not found
		handlerName = handlerDefaultName;

		// override the focus events for like textareas
		if (event.type == 'focusin')
		{
			handlerName = 'toggleOn';
		}
		else if (event.type == 'focusout')
		{
			handlerName = 'toggleOff';
		}

		if (handlerDefaultName != 'toggle')
		{
			return handlerName;
		}

		// override checkboxes to see if they are selected
		if (elementType == 'checkbox')
		{
			handlerName = element.is(':checked') ? 'toggleOn' : 'toggleOff';
		}

		return handlerName;
	}

	/**
	 * Get the default event type for an element. This differs
	 * based on what type the element is. If it is an input type
	 * of text or checkbox or select or a href element then we
	 * treat these differently. The default is just 'click'
	 *
	 */
	function getEventType(element, settings)
	{
		var elementType = getElementType(element);

		if (typeof settings.eventType[elementType] !== 'undefined')
		{
			return settings.eventType[elementType];
		}

		return settings.eventType.others;
	}

	/**
	 * Helper function to get the class on and off toggles which can
	 * be overridden by the user per element.
	 *
	 */
	function getToggleClasses(element, selected, settings)
	{
		var classNameOverride = element.attr(settings.selectors.toggleOnClass);
		var toggleOnClass = settings.toggleOnClass;
		var toggleOffClass = settings.toggleOffClass;

		if (typeof classNameOverride !== 'undefined')
		{
			toggleOnClass = classNameOverride;
		}

		classNameOverride = element.attr(settings.selectors.toggleOffClass);

		if (typeof classNameOverride !== 'undefined')
		{
			toggleOffClass = classNameOverride;
		}

		return {on : trim(toggleOnClass), off: trim(toggleOffClass)};
	}

	/**
	 * Returns the toggleClasses unless they have been
	 * overriden by the child option element that is now
	 * selected.
	 *
	 */
	function getToggleClassesForOption(element, toggleClasses, settings)
	{
		var classNameOverride = element.attr(settings.selectors.toggleOnClass);

		if (typeof classNameOverride !== 'undefined')
		{
			toggleClasses.on = trim(classNameOverride);
		}

		classNameOverride = element.attr(settings.selectors.toggleOffClass);

		if (typeof classNameOverride !== 'undefined')
		{
			toggleClasses.off = trim(classNameOverride);
		}

		return toggleClasses;
	}

	/**
	 * Returns selected unless the option has overriden
	 * the element that should be toggled
	 *
	 */
	function getSelectedElementForOption(element, selected, attrSelector)
	{
		var override = element.attr(attrSelector);

		if (typeof override !== 'undefined')
		{
			override = trim(override);

			if (override != '')
			{
				selected = $(override);
			}
		}

		return selected;
	}

	/**
	 * Returns the normal handler unless it has been overriden
	 * by the child option element that is active
	 *
	 */
	function getHandlerForOption(element, selected, event, handler, settings)
	{
		var override = element.attr(settings.selectors.handler);

		if (typeof override !== 'undefined')
		{
			handler = settings.handlers[override];

			if (typeof handler === 'undefined')
			{
				console.warn('Could not find handler for ' + override, element);
			}
		}

		return handler;
	}

	/**
	 * Trim a string's whitespace. We use this because IE8 doesn't
	 * have the String.prototype.trim fucntion.
	 *
	 */
	function trim(string)
	{
		return string.replace(/^\s+|\s+$/g, '');
	}

	/**
	 * Returns a closure for handling the event. This
	 * takes into account the settings as well.
	 */
	function handleEvent(settings, handler, eventType)
	{
		return function(event)
		{
			// we don't want to trigger this on mouseover
			// or other events when we just want click event
			// or another specific event
			if (isMatchingEventType(event, settings))
			{
				handler(event, eventType, settings);
			}
		}
	}

	/**
	 * Register an element with the given settings. This
	 * will search through all the children of the element
	 * and use the selectors for all given events.
	 *
	 * We also want to ensure we don't register listeners
	 * on the same element twice as this would cause lots
	 * of head aches.
	 *
	 */
	function register(element, settings)
	{
		var isAlreadyRegistered = $(element).attr(settings.selectors.registered);

		if (isAlreadyRegistered === "true" || isAlreadyRegistered === true)
		{
			return;
		}

		// check if parent has been registered, we should not do nested
		// data-toggler-inits, but we should childproof just in case
		var parentInitializer = $(element).closest('[' + settings.selectors.registered + ']');

		if (parentInitializer.length > 0)
		{
			console.warn('not registering', element, 'because it has registered parent', parentInitializer);
			return;
		}

		// register events in a specific order
		for (var index in settings.eventOrdering)
		{
			var eventType = settings.eventOrdering[index];
			$(element).on(settings.eventTypes, '['+settings.selectors[eventType]+']', handleEvent(settings, onEvent, eventType));
		}


		$(element).settings = settings;
		$(element).setHandler = $.fn.toggler.setHandler;
		$(element).attr(settings.selectors.registered, true);

		settings.bootstrap($(element), settings);
	}

	/**
	 * Register a toggler on an element. This will
	 * use this as the base selector and search out and
	 * find all children elements (even dynamically created
	 * ones) for the toggleSelector, offSelector and onSelector
	 *
	 */
	$.fn.toggler = function(options)
	{
		var settings = $.extend( {}, $.fn.toggler.defaults, options );

		return this.each(function (index, element)
		{
			register(element, settings);
		});
	};

	/**
	 * Sets a handler in our handler registry. This allows
	 * us to do custom handlers for switch events if we
	 * choose to do so. Else we just fallback to the normal
	 * stuff, like toggle, toggleOn and toggleOff.
	 *
	 */
	$.fn.toggler.setHandler = function(name, handler)
	{
		if (typeof this.settings !== 'undefined' && typeof this.settings.handlers !== 'undefined')
		{
			this.settings.handlers[name] = handler;
		}
		else
		{
			$.fn.toggler.defaults.handlers[name] = handler;
		}
	};

	/**
	 * Defaults for this plugin
	 *
	 */
	$.fn.toggler.defaults =
	{
		animateDelay	: 1000,
		toggleOffClass	: "",
		toggleOnClass 	: "active",
		eventOrdering 	: ['toggle', 'toggleOff', 'toggleOn', 'animate'],
		eventTypes		: 'click dblclick change focusin focusout mousedown mouseup mouseover mousemove mouseenter mouseout dragstart drag dragenter dragleave dragover drop dragend keypress keyup',
		eventType 		: {
			text 		: "focusin focusout",
			textarea 	: "focusin focusout",
			radio 		: "change",
			checkbox 	: "change",
			select 		: "change",
			option 		: "change",
			others 		: "click"
		},

		selectors			: {
			animate 		: "data-toggler-animate",
			toggle 			: "data-toggler",
			toggleOn 		: "data-toggler-on",
			toggleOff 		: "data-toggler-off",
			toggleOffClass 	: "data-toggler-off-class",
			toggleOnClass 	: "data-toggler-on-class",
			eventType 		: "data-toggler-event",
			handler 		: "data-toggler-handler",
			init 			: "data-toggler-init",
			registered 		: "data-toggler-registered"
		},

		bootstrap 	: function(element, settings) { },

		handlers: {
			animate: function(selected, toggle, event, settings)
			{
				settings.handlers.toggle(selected, toggle, event, settings);
				setTimeout(function() { settings.handlers.toggle(selected, toggle, event, settings); }, settings.animateDelay);
			},

			toggle: function(selected, toggle, event, settings)
			{
				selected.toggleClass(toggle.on);

				selected.toggleClass(toggle.off, !selected.hasClass(toggle.on));
			},

			toggleOn: function(selected, toggle, event, settings)
			{
				selected.addClass(toggle.on);

				selected.removeClass(toggle.off);
			},

			toggleOff: function(selected, toggle, className, event, settings)
			{
				selected.removeClass(toggle.on);

				selected.addClass(toggle.off);
			}
		}
	};

	/**
	 * Self initializing plugin but can be stopped
	 * by overriding the [toggle-init] on the page
	 *
	 */
	$(function()
	{
		var selector = $.fn.toggler.defaults.selectors.init;

		if ($('['+selector+']').length == 0)
		{
			return $('body').toggler();
		}

		$('['+selector+']').each(function(index, initializer)
		{
			initializer = $(initializer);

			var element = initializer.attr(selector);

			if (element === "false" || element === false)
			{
				return;
			}

			if (trim(element) != '')
			{
				return $(element).toggler();
			}

			return initializer.toggler();
		});
	});

})(jQuery);

