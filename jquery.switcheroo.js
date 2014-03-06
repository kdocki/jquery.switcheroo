/**
 * @author  Kelt <kelt@dockins.org>
 * @license  MIT
 */
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
	$.fn.switcheroo.setHandler = function(name, handler)
	{
		if (typeof this.settings !== 'undefined' && typeof this.settings.handlers !== 'undefined')
		{
			this.settings.handlers[name] = handler;
		}
		else
		{
			$.fn.switcheroo.defaults.handlers[name] = handler;
		}
	};

	/**
	 * Defaults for this plugin
	 *
	 */
	$.fn.switcheroo.defaults =
	{
		animateDelay	: 1000,
		bootstrap 		: function(element, settings) { },
		eventOrdering 	: ['toggle', 'toggleOff', 'toggleOn'],
		eventTypes		: 'click dblclick change focusin focusout mousedown mouseup mouseover mousemove mouseenter mouseout dragstart drag dragenter dragleave dragover drop dragend keypress keyup',
		initDefault		: 'body',
		toggleClasses	: ['', 'active'],
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
			toggle 			: "data-switch",
			toggleOn 		: "data-switch-on",
			toggleOff 		: "data-switch-off",
			toggleTo 		: "data-switch-to",
			toggleAnimate 	: "data-switch-animate",
			toggleClass 	: "data-switch-class",
			toggleStep		: "data-switch-step",
			eventType 		: "data-switch-event",
			handler 		: "data-switch-handler",
			init 			: "data-switch-init",
			registered 		: "data-switch-registered"
		},
		handlers: {
			animate: function(selected, toggle, event, settings)
			{
				settings.handlers.toggle(selected, toggle, event, settings);

				setTimeout(function() { settings.handlers.toggle(selected, { on: toggle.off, off: toggle.on }, event, settings); }, settings.animateDelay);
			},

			toggle: function(selected, toggle, event, settings)
			{
				selected.toggleClass(toggle.off);

				selected.toggleClass(toggle.on);
			},

			toggleOn: function(selected, toggle, event, settings)
			{
				if (toggle.on != toggle.off)
				{
					selected.removeClass(toggle.off);
				}

				selected.addClass(toggle.on);
			},

			toggleOff: function(selected, toggle, event, settings)
			{
				if (toggle.on != toggle.off)
				{
					selected.removeClass(toggle.off);
				}

				selected.addClass(toggle.on);
			},

			toggleTo : function(selected, toggle, event, settings)
			{
				if (toggle.on != toggle.off)
				{
					selected.removeClass(toggle.off);
				}

				selected.addClass(toggle.on);
			}
		}
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
	 * Handle different event types that come through. If we've made
	 * it this far then we should process the event because it
	 * was a matching event type.
	 *
	 */
	function onEvent(event, handlerDefaultName, settings)
	{
		var toggle = {};

		toggle.selected = getElementToChange(event, handlerDefaultName, settings);
		toggle.handler = getEventHandler(event, handlerDefaultName, settings);
		toggle.classes = getToggleClasses(event, handlerDefaultName, settings);

		return toggle.handler(toggle.selected, toggle.classes, event, settings);
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
	function getElementToChange(event, handlerDefaultName, settings)
	{
		var element = $(event.currentTarget);
		var selector = element.attr(settings.selectors[handlerDefaultName]);
		var elementType = getElementType(element);

		// overrides for select option
		if (elementType == 'select')
		{
			var optionSelector = element.find(':selected').attr(settings.selectors[handlerDefaultName]);

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
	 * instance. This can be overridden in several ways so we
	 * use a function to help us with that. It can be overridden
	 * because of the event type or there is a [data-switch-handler]
	 * attribute on the element.
	 *
	 */
	function getEventHandler(event, handlerDefaultName, settings)
	{
		var handlerName = getEventHandlerName(event, handlerDefaultName, settings);

		if (typeof settings.handlers[handlerName] === 'undefined')
		{
			console.warn('Could not find handler for ' + handlerName, $(event.currentTarget));
		}

		return settings.handlers[handlerName];
	}

	/**
	 * We get the event handler name we should be working with
	 * because this can be overridden at any point. This is done
	 * by the [data-switch-handler] or by the event.type.
	 *
	 */
	function getEventHandlerName(event, handlerDefaultName, settings)
	{
		var element = $(event.currentTarget);
		var elementType = getElementType(element);
		var handlerName = element.attr(settings.selectors.handler);

		if (elementType == "select")
		{
			var optionHandlerName = element.find(":selected").attr(settings.selectors.handler);

			// if (typeof optionHandlerName !== 'undefined' && optionHandlerName)
		}

		if (typeof handlerName !== 'undefined')
		{
			return handlerName;
		}

		return handlerDefaultName;
	}

	/**
	 * Get the classes we should turn on and off.
	 *
	 */
	function getToggleClasses(event, handlerDefaultName, settings)
	{
		return {on: 'active', off: ''};
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
		// data-switch-init, but we should childproof just in case
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
		$(element).setHandler = $.fn.switcheroo.setHandler;
		$(element).attr(settings.selectors.registered, true);

		settings.bootstrap($(element), settings);
	}

})(jQuery);