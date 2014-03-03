/**
 * This plugin basically registers an event listener on
 * the element's children that match a selector for
 * clicks/changes/etc
 *
 * <a href="#" toggle="#foobar">Toggle foobar</a>
 * <div id="foobar">Toggle the active class on this</div>
 *
 * toggle="#foobar"
 * toggle="#foobar" toggle-on
 * toggle-class="active"
 * toggle-event="click"
 * toggle-handler="nameOfRegisteredHandler"
 *
 * Set defaults with
 *
 * $.fn.toggler.defaults.classNames = ['', 'active', 'after-active'];
 * 
 * If you use a custom handler then you need to do
 *
 * $.fn.toggler.addHandler('name', function(selected, element, className, event, settings)
 * {
 *   ...
 * }
 *
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
	function onEvent(event, handlerType, settings)
	{
		var element = $(event.currentTarget);
		var className = getActiveClass(element, settings);
		var selected = element.attr(settings.selectors[handlerType]);
		var handlerName = element.attr(settings.selectors.handler);

		if (typeof handlerName === 'undefined')
		{
			handlerName = handlerType;
		}

		var handler = settings.handlers[handlerName];

		if (typeof handler === 'undefined')
		{
			console.warn('Could not find handler for ' + handlerName, element);
		}

		return handler($(selected), element, className, event, settings);
	}

	/**
	 * Toggle the active class on this element
	 *
	 */
	function onToggle(event, settings)
	{
		return onEvent(event, 'toggle', settings);
	}

	/**
	 * Turn on the active class on this element
	 *
	 */
	function onSwitchOn(event, settings)
	{
		return onEvent(event, 'switchOn', settings);
	}

	/**
	 * Turn off the active class on this element
	 *
	 */
	function onSwitchOff(event, settings)
	{
		return onEvent(event, 'switchOff', settings);
	}

	/**
	 * When we first bootstrap the element
	 * we want to know if there is an child
	 * element that makes this thing active
	 *
	 */
	function onBootstrap(element, settings)
	{

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
			if (eventType[index].trim() == event.type)
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
	 * Return the class we should toggle between here
	 *
	 */
	function getActiveClass(element, settings)
	{
		var classNameOverride = element.attr(settings.selectors.className);

		if (typeof classNameOverride != 'undefined')
		{
			return classNameOverride;
		}

		return settings.className;
	}

	/**
	 * Returns a closure for handling the event. This
	 * takes into account the settings as well.
	 */
	function handleEvent(settings, handler)
	{
		return function(event)
		{
			if (isMatchingEventType(event, settings))
			{
				handler(event, settings);
			}
		}
	}

	/**
	 * Register an element with the given settings. This
	 * will search through all the children of the element
	 * and use the selectors for all given events.
	 *
	 */
	function register(element, settings)
	{
		$(element).on(settings.eventTypes, '['+settings.selectors.toggle+']', handleEvent(settings, onToggle));
		$(element).on(settings.eventTypes, '['+settings.selectors.switchOn+']', handleEvent(settings, onSwitchOn));
		$(element).on(settings.eventTypes, '['+settings.selectors.switchOff+']', handleEvent(settings, onSwitchOff));

		settings.onBootstrap($(element), settings);
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

		var selector = this.selector;

		if (typeof registered[selector] === 'undefined')
		{
			registered[selector] = this.each(function (index, element)
			{
				register(element, settings);
			});

			registered[selector].settings = settings;
			registered[selector].setHandler = $.fn.toggler.setHandler;
		}

		return registered[selector];
	};

	/**
	 * Sets a handler in our handler registry. This allows
	 * us to do custom handlers for switch events if we
	 * choose to do so. Else we just fallback to the normal
	 * stuff, like toggle, switchOn and switchOff.
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
	$.fn.toggler.defaults = {
		className : "active",
		onBootstrap: onBootstrap,
		eventTypes: 'click dblclick change focusin focusout mousedown mouseup mouseover mousemove mouseout dragstart drag dragenter dragleave dragover drop dragend keypress keyup',
		eventType: {
			text: "focusin focusout",
			textarea: "focusin focusout",
			radio: "change",
			checkbox: "change",
			select: "change",
			others: "click"
		},
		selectors: {
			className: "toggle-class",
			toggle: "toggle",
			switchOn: "toggle-on",
			switchOff: "toggle-off",
			eventType: "toggle-event",
			handler: "toggle-handler",
			init: "toggle-init"
		},
		handlers: {
			toggle: function(selected, element, className, event, settings)
			{
				var elementType = getElementType(element);
				var eventType = getEventType(element, settings);

				// focus events
				if (event.type == 'focusin')
				{
					return settings.handlers.switchOn.apply(this, arguments);
				}
				else if (event.type == 'focusout')
				{
					return settings.handlers.switchOff.apply(this, arguments);
				}

				// checkboxes
				if (elementType == 'radio' || elementType == 'checkbox')
				{
					if (element.is(':checked'))
					{				
						return settings.handlers.switchOn.apply(this, arguments);
					}

					return settings.handlers.switchOff.apply(this, arguments);
				}

				// all other types and events
				if (selected.hasClass(className))
				{
					return settings.handlers.switchOff.apply(this, arguments);
				}

				return settings.handlers.switchOn.apply(this, arguments);
			},

			switchOn: function(selected, element, className, event, settings)
			{
				if (!selected.hasClass(className))
				{
					selected.addClass(className);
				}
			},

			switchOff: function(selected, element, className, event, settings)
			{
				if (selected.hasClass(className))
				{
					selected.removeClass(className);
				}
			}
		}
	};

	/**
	 * this is a self initializing plugin but can be stopped
	 * by overriding the [toggle-init] on the page
	 *
	 * @return {[type]} [description]
	 */
	$(function()
	{
		var selector = $.fn.toggler.defaults.selectors.init;
		var initializer = $('['+selector+']');

		if (initializer.length == 0)
		{
			return $('body').toggler();
		}

		var element = initializer.attr(selector);

		if (element == "false" || element == false)
		{
			return;
		}

		return initializer.toggler();
	});

})(jQuery);

