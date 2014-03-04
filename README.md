# jquery.toggler

What is it? What is it good for? *huggh* absolutely nothing. This is meant to be a dropin for toggles and switches. It works much like how the Gumby framework handles toggles and switches. 

I have tested this plugin in the following browsers and it works as expected. It is recommend to use jQuery 1.11 if you need to support IE8.

- IE8, IE9 (cannot use jquery 2.0)
- IE10, IE11
- Chrome 33.0
- Firefox 27.0.1

## Quickstart

First include the toggler script.

```html
  <script src="jquery.min.js"></script>
  <script src="jquery.toggler.js"></script>
```

Next write some markup

```html
  <a href="#" data-toggler="#foobar">Click me</a>

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

```js
	$.fn.toggler.defaults =
	{
		toggleOffClass	: "",
		toggleOnClass 	: "active",
		eventTypes		: 'click dblclick change focusin focusout mousedown mouseup mouseover mousemove mouseout dragstart drag dragenter dragleave dragover drop dragend keypress keyup',
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
			toggle 			: "data-toggler",
			toggleOn 		: "data-toggler-on",
			toggleOff 		: "data-toggler-off",
			toggleOffClass 	: "data-toggler-off-class",
			toggleOnClass 	: "data-toggler-on-class",
			eventType 		: "data-toggler-event",
			handler 		: "data-toggler-handler",
			init 			: "data-toggler-init"
		},

		bootstrap 	: function(element, settings) { },

		handlers: {
			toggle: function(selected, toggle, event, settings)
			{
				if (toggle.off != '')
				{
					selected.toggleClass(toggle.off, !selected.hasClass(toggle.on));
				}

				selected.toggleClass(toggle.on);
			},

			toggleOn: function(selected, toggle, event, settings)
			{
				if (!selected.hasClass(toggle.on))
				{
					selected.addClass(toggle.on);
				}

				if (toggle.off != "" && selected.hasClass(toggle.off))
				{
					selected.removeClass(toggle.off);
				}
			},

			toggleOff: function(selected, toggle, className, event, settings)
			{
				if (selected.hasClass(toggle.on))
				{
					selected.removeClass(toggle.on);
				}

				if (toggle.off != "" && !selected.hasClass(toggle.off))
				{
					selected.addClass(toggle.off);
				}
			}
		}
	};
```

## See more examples?

Clone/download this repository and run 

```
  bower install
```

then load up `examples/simple.html` or a different page to view some examples.


