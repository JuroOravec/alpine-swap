# Alpine Swap Plugin

An implementation of HTMX swap attributes as an AlpineJS plugin.

## Installation

### Module

Create a new file and paste in the [plugin source](src/index.js).

Register the plugin before calling **Alpine.start()**.

```javascript
import AlpineSwap from '/my-alpine-plugins/alpine-swap.js'

window.Alpine = Alpine

Alpine.plugin(AlpineSwap)

Alpine.start()
```

## $Swap Magic Helper

### Usage

Example:

```javascript
$swap({ 
  select: '#outerHTML .source', 
  target: '#outerHTML .target', 
  swapMethod: 'outerHTML',
  transition: true
})
```

### Arguments

#### settings: object

Default Settings Object

```javascript
{
  endpoint: window.location.href,
  select: null,
  target: el,
  swapMethod: 'innerHTML',
  transition: false,
  morph: false,
  settleDelay: 20 //milliseconds
}
```

## Settings Options

### `endpoint` string (optional)
Default: The current URL.

The URL for the GET request.

### `select` string (optional)
Default: Request body.

A valid CSS selector to select the element that will be swapped into the current page.

> Note: This selector can select 1 or more elements. Ex. Both ul li and ul#unique-id are okay.

### `target` string|HTMLElement (optional)
Default: The element that called $swap.

A valid CSS selector or HTML element.

### `swapMethod` string (optional)
Default: 'innerHTML'

| Method | Description |
| --- | --- |
| `innerHTML` | The default, replace the inner html of the target element.  |
| `outerHTML` | Replace the entire target element with the response.  |
| `beforebegin` | TInsert the response before the target element.  |
| `afterbegin` | Insert the response before the first child of the target element.  |
| `beforeend` | Insert the response after the last child of the target element.  |
| `afterend` | Insert the response after the target element.  |

### `transition` boolean (optional)
Default: false

Use the new View Transitions API when a swap occurs.

### `morph` boolean (optional)
Default: false

Whether or not to use Alpine Morph when inserting elements. Alpine Morph must be loaded first. 

> Only works with swap method outerHTML

### `settleDelay` number (optional)
Default: 20

Delay after swapping before items are considered "settled". Order of operations are derived from HTMX. Learn more [here](https://htmx.org/docs/#request-operations).

## Events

### Event `alpineSwap:beforeRequest`

This event is triggered before an AJAX request is issued. 

#### Details
- `elt` Trigger element
- `target` Target element
- `requestConfig` Options to be passed to `fetch()`

### Event `alpineSwap:beforeSwap`

#### Details
- `endpoint`
- `elt` Trigger element
- `select` CSS selector used for querySelector
- `fragment` Response fragment
- `target` Target element
- `swapMethod`
- `transition`
- `morph`

### Event `alpineSwap:afterSwap`

- `endpoint`
- `elt` Trigger element
- `select` CSS selector used for querySelector
- `fragment` Response fragment
- `target` Target element
- `swapMethod`
- `transition`
- `morph`

### Event `alpineSwap:responseError`

