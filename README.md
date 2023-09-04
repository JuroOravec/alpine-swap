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
$swap('/some-endpoint', '.select li', '.target', 'innerHTML', () => { console.log('swap settled') })
```

### Arguments

#### endpoint: string|false
A string representing the URL from where to fetch HTML from. If falsy, will fetch from the current URL.

#### select: string|false
A valid CSS selector for the element(s) that will be swapped into our current page. If falsy, the document body will be selected.

#### target: string:false
A valid CSS selector for the element upon which the swap will be made. If falsy, the element calling **$swap()** will be the target.

#### 