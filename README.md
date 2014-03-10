# jquery.switcheroo

What is it? What is it good for? *huggh* absolutely nothing. This is meant to be a dropin for toggles and switches. It works much like how the Gumby framework handles toggles and switches.

## Examples

Showing *is better* than telling. Don't believe me? Just ask [the teacher](http://youtu.be/UXQYcNSNIb8?t=1m26s).

So go ahead and check out the examples at **http://kdocki.github.io/jquery.switcheroo**.

## Quickstart

First include the switcheroo script.

```html
  <script src="jquery.min.js"></script>
  <script src="jquery.switcheroo.js"></script>
```

Next write some markup

```html
  <a href="#" data-switch="#foobar">Click me</a>

  <div id="foobar">
   Hello there.
  </div>
```

What does this do? Not much. THe only thing it does is toggle an `.active` class to #foobar when you click on the `<a>` tag.

It is up to you to determine what happens in active/non-active states via css rules. So let's only show `#foobar` when active.

```css
 #foobar.active {
  display: inherit;
 }

 #foobar {
  display: none;
 }
```

This is a pretty simple example. You can get pretty advanced with this plugin. For more options read below or visit the examples folder.

## Options

Of course you can change any of these options to match your needs.

```js
$.fn.switcheroo.defaults =
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
```

## See more examples?

Clone/download this repository and run

```
  bower install
```

then load up `examples/simple.html` or a different page to view some examples.

## Testing

I have tested this plugin in the following browsers and it works as expected. It is recommend to use jQuery 1.11 if you need to support IE8.

- IE8, IE9 (cannot use jquery 2.0)
- IE10, IE11
- Chrome 33.0
- Firefox 27.0.1

