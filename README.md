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
  transition: true,
  onSettle: (target) => { 
    console.log(target) 
  }
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
  onSettle: () => { }
}
```

### Settings Options

#### endpoint: string (optional)
Default: The current URL.
The URL for the GET request.

#### select: string (optional)
Default: Request body.
A valid CSS selector to select the element that will be swapped into the current page.

> Note: This selector can select 1 or more elements. Ex. Both ul li and ul#unique-id are okay.

#### target: string|HTMLElement (optional)
Default: The element that called $swap.
A valid CSS selector or HTML element.

#### swapMethod: string (optional)
Default: 'innerHTML'
| Method | Description |
| --- | --- |
| `innerHTML` | The default, replace the inner html of the target element.  |
| `outerHTML` | Replace the entire target element with the response.  |
| `beforebegin` | TInsert the response before the target element.  |
| `afterbegin` | Insert the response before the first child of the target element.  |
| `beforeend` | Insert the response after the last child of the target element.  |
| `afterend` | Insert the response after the target element.  |

#### transition: boolean (optional)
Default: false
Use the new View Transitions API when a swap occurs.

#### onSettle: function (optional)
A callback that is called after the source is swapped into the current page.