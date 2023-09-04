export default function (Alpine) {

  function insertNodesBefore(parentNode, insertBefore, fragment) {
    while (fragment.childNodes.length > 0) {
      const child = fragment.firstChild;
      parentNode.insertBefore(child, insertBefore);
    }
  }

  const fetchHTML = async (endpoint) => {
    return await fetch(endpoint)
      .then((response) => response.text())
      .then((responseText) => {
        return new DOMParser().parseFromString(responseText, 'text/html')
      })
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

  function swapOuterHTML(target, fragment, onSettle) {
    if (target.tagName === "BODY") {
      return swapInnerHTML(target, fragment, onSettle);
    } else {
      // @type {HTMLElement}

      if (Alpine.morph) {
        Alpine.morph(target, fragment)
      } else {
        target.replaceWith(fragment)
      }
    }

    return onSettle.call(this, target)
  }

  function swapAfterBegin(target, fragment, onSettle) {
    insertNodesBefore(target, target.firstChild, fragment)
    return onSettle.call(this, target)
  }

  function swapBeforeBegin(target, fragment, onSettle) {
    insertNodesBefore(target.parentElement, target, fragment)
    return onSettle.call(this, target)
  }

  function swapBeforeEnd(target, fragment, onSettle) {
    insertNodesBefore(target, null, fragment);
    return onSettle.call(this, target)
  }

  function swapAfterEnd(target, fragment, onSettle) {
    insertNodesBefore(target.parentElement, target.nextSibling, fragment);
    return onSettle.call(this, target)
  }

  function swapInnerHTML(target, fragment, onSettle) {
    var firstChild = target.firstChild;
    insertNodesBefore(target, target.firstChild, fragment.firstChild);

    if (firstChild) {
      while (firstChild.nextSibling) {
        target.removeChild(firstChild.nextSibling);
      }
      target.removeChild(firstChild);
    }

    return onSettle.call(this, target)
  }

  function swap(swapMethod, target, fragment, onSettle) {
    switch (swapMethod) {
      case "none":
        return;
      case "outerHTML":
        swapOuterHTML(target, fragment, onSettle);
        return;
      case "afterbegin":
        swapAfterBegin(target, fragment, onSettle);
        return;
      case "beforebegin":
        swapBeforeBegin(target, fragment, onSettle);
        return;
      case "beforeend":
        swapBeforeEnd(target, fragment, onSettle);
        return;
      case "afterend":
        swapAfterEnd(target, fragment, onSettle);
        return;
      default:
        swapInnerHTML(target, fragment, onSettle);
        return
    }
  }


  Alpine.magic('swap', (el, { Alpine }) => (settings) => {

    let defaultSettings = {
      endpoint: window.location.href,
      select: null,
      target: el,
      swapMethod: 'innerHTML',
      onSettle: () => { },
      transition: false
    }

    const {
      endpoint,
      select,
      target,
      swapMethod,
      onSettle,
      transition
    } = Object.assign(defaultSettings, settings)

    fetchHTML(endpoint).then((response) => {

      let fragment = document.createDocumentFragment()
      const selected = selectedElement(select, response)

      selected.forEach((node) => {
        fragment.appendChild(node.cloneNode(true))
      })

      if (transition && document.startViewTransition) {
        document.startViewTransition(() => {
          swap(swapMethod, targetElement(target), fragment, onSettle)
        })
      } else {
        swap(swapMethod, targetElement(target), fragment, onSettle)
      }
    })
  })
}