export default function (Alpine) {

  function insertNodesBefore(parentNode, insertBefore, fragment) {
    while (fragment.childNodes.length > 0) {
      const child = fragment.firstChild;
      parentNode.insertBefore(child, insertBefore);
    }
  }

  const fetchHTML = async (endpoint, requestConfig, target, elt) => {
    return await fetch(endpoint, requestConfig)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText)
        }

        return response.text()
      })
      .then((responseText) => {
        return new DOMParser().parseFromString(responseText, 'text/html')
      })
      .catch((error) => {
        emitEvent('alpineSwap:responseError', target, {
          error,
          elt: elt,
          target
        })
      })
  }

  const emitEvent = (event, target, detail = {}) => {
    target.dispatchEvent(new CustomEvent(event, {
      bubbles: true,
      cancelable: true,
      detail
    }))
  }

  const targetElement = (target) => {
    if (typeof target === 'string') {
      return document.querySelector(target)
    } else if (target instanceof HTMLElement) {
      return target
    } else {
      return null
    }
  }

  const selectedElement = (select, response) => {
    if (select && typeof select === 'string') {
      return response.querySelectorAll(select)
    } else {
      return [response.body]
    }
  }

  function swapOuterHTML(target, fragment) {
    if (target.tagName === "BODY") {
      return swapInnerHTML(target, fragment);
    } else {
      // @type {HTMLElement}

      if (Alpine.morph) {
        Alpine.morph(target, fragment)
      } else {
        target.replaceWith(fragment)
      }
    }

    return 
  }

  function swapAfterBegin(target, fragment) {
    insertNodesBefore(target, target.firstChild, fragment)
    return 
  }

  function swapBeforeBegin(target, fragment) {
    insertNodesBefore(target.parentElement, target, fragment)
    return 
  }

  function swapBeforeEnd(target, fragment) {
    insertNodesBefore(target, null, fragment);
    return 
  }

  function swapAfterEnd(target, fragment) {
    insertNodesBefore(target.parentElement, target.nextSibling, fragment);
    return 
  }

  function swapInnerHTML(target, fragment) {
    var firstChild = target.firstChild;
    insertNodesBefore(target, target.firstChild, fragment.firstChild);

    if (firstChild) {
      while (firstChild.nextSibling) {
        target.removeChild(firstChild.nextSibling);
      }
      target.removeChild(firstChild);
    }

    return 
  }

  function swap(swapMethod, target, fragment) {
    switch (swapMethod) {
      case "none":
        return;
      case "outerHTML":
        swapOuterHTML(target, fragment);
        return;
      case "afterbegin":
        swapAfterBegin(target, fragment);
        return;
      case "beforebegin":
        swapBeforeBegin(target, fragment);
        return;
      case "beforeend":
        swapBeforeEnd(target, fragment);
        return;
      case "afterend":
        swapAfterEnd(target, fragment);
        return;
      default:
        swapInnerHTML(target, fragment);
        return
    }
  }

  Alpine.magic('swap', (el, { Alpine }) => (settings) => {

    let defaultSettings = {
      endpoint: window.location.href,
      select: null,
      target: el,
      swapMethod: 'innerHTML',
      transition: false
    }

    const {
      endpoint,
      select,
      target,
      swapMethod,
      transition
    } = Object.assign(defaultSettings, settings)

    const targetEl = targetElement(target)
    const requestConfig = {}

    emitEvent('alpineSwap:beforeRequest', targetEl, {
      elt: el,
      target: targetEl,
      requestConfig
    })

    fetchHTML(endpoint, requestConfig, targetEl, el).then((response) => {
      
      if (!response) return
      
      let fragment = document.createDocumentFragment()
      const selected = selectedElement(select, response)

      selected.forEach((node) => {
        fragment.appendChild(node.cloneNode(true))
      })

      emitEvent('alpineSwap:beforeSwap', targetEl, {
        endpoint,
        elt: el,
        select,
        fragment: fragment,
        target: targetEl,
        swapMethod,
        transition
      })

      if (transition && document.startViewTransition) {
        document.startViewTransition(() => {
          swap(swapMethod, targetEl, fragment)
        })
      } else {
        swap(swapMethod, targetEl, fragment)
      }

      emitEvent('alpineSwap:afterSwap', targetEl, {
        endpoint,
        elt: el,
        select,
        fragment: fragment,
        target: targetEl,
        swapMethod,
        transition
      })
    })
  })
}