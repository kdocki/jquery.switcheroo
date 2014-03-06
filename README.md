# jquery.switcheroo

What is it? What is it good for? *huggh* absolutely nothing. This is meant to be a dropin for toggles and switches. It works much like how the Gumby framework handles toggles and switches.

I have tested this plugin in the following browsers and it works as expected. It is recommend to use jQuery 1.11 if you need to support IE8.

- IE8, IE9 (cannot use jquery 2.0)
- IE10, IE11
- Chrome 33.0
- Firefox 27.0.1

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

```js

```

## See more examples?

Clone/download this repository and run 

```
  bower install
```

then load up `examples/simple.html` or a different page to view some examples.