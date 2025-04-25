export default function (Alpine) {

  function insertNodesBefore(parentNode, insertBefore, fragment, settleInfo) {
    while (fragment.childNodes.length > 0) {
      const child = fragment.firstChild
      parentNode.insertBefore(child, insertBefore)
      settleInfo.addedEls.push(child)
    }
  }

  const fetchHTML = async ({ endpoint, requestConfig, target, elt, onError, onSuccess }) => {
    addClass(elt, 'alpine-swap-request')

    return await fetch(endpoint, requestConfig)
      .then((response) => {

        removeClass(elt, 'alpine-swap-request')

        if (!response.ok) {
          throw new Error(response.statusText)
        }

        return response.text()
      })
      .then((responseText) => {
        return new DOMParser().parseFromString(responseText, 'text/html')
      })
      .catch((error) => {
        if (onError) {
          onError(error);
        }

        emitEvent('alpineSwap:responseError', target, {
          error,
          elt: elt,
          target
        })
      })
  }

  function forEach(arr, func) {
    if (!arr) return

    for (var i = 0; i < arr.length; i++) {
      func(arr[i], i)
    }
  }

  const emitEvent = (event, target, detail = {}) => {
    target.dispatchEvent(new CustomEvent(event, {
      bubbles: true,
      cancelable: true,
      detail
    }))
  }

  function addClass(el, clazz) {
    if (!el.classList) return

    el.classList.add(clazz)
  }

  function removeClass(el, clazz) {
    if (!el.classList) return

    el.classList.remove(clazz)
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

  function makeSettleInfo(target, delay) {
    return {
      tasks: [],
      elts: [target],
      addedEls: [],
      delay: delay
    };
  }

  function doSettle(settleInfo) {
    forEach(settleInfo.tasks, task => task())
    forEach(settleInfo.elts, el => addClass(el, 'alpine-swap-settling'))
    forEach(settleInfo.addedEls, el => addClass(el, 'alpine-swap-added'))

    setTimeout(() => {
      forEach(settleInfo.elts, el => removeClass(el, 'alpine-swap-settling'))
      forEach(settleInfo.addedEls, el => removeClass(el, 'alpine-swap-added'))
    }, settleInfo.delay)
  }

  const selectedElement = (select, response) => {
    if (select && typeof select === 'string') {
      return response.querySelectorAll(select)
    } else {
      return [response.body]
    }
  }

  function swapOuterHTML(target, fragment, settleInfo, morph) {
    if (target.tagName === "BODY") {
      return swapInnerHTML(target, fragment);
    } else {
      // @type {HTMLElement}

      const fragmentContents = fragment.firstElementChild

      settleInfo.elts.push(fragmentContents)

      settleInfo.addedEls.push(fragmentContents)

      if (morph && Alpine.morph) {
        Alpine.morph(target, fragmentContents)
      } else {
        if (morph) {
          console.error("Alpine Swap: Alpine.morph is not available. Please include the Alpine Morph plugin and register it before Alpine Swap.")
        }
        target.replaceWith(fragmentContents)
      }
    }
  }

  function swapAfterBegin(target, fragment, settleInfo) {
    insertNodesBefore(target, target.firstChild, fragment, settleInfo)
  }

  function swapBeforeBegin(target, fragment, settleInfo) {
    insertNodesBefore(target.parentElement, target, fragment, settleInfo)
  }

  function swapBeforeEnd(target, fragment, settleInfo) {
    insertNodesBefore(target, null, fragment, settleInfo);
  }

  function swapAfterEnd(target, fragment, settleInfo) {
    insertNodesBefore(target.parentElement, target.nextSibling, fragment, settleInfo);
  }

  function swapInnerHTML(target, fragment, settleInfo) {
    console.log('innerHTML')
    var firstChild = target.firstChild;
    insertNodesBefore(target, target.firstChild, fragment.firstChild, settleInfo);

    if (firstChild) {
      while (firstChild.nextSibling) {
        target.removeChild(firstChild.nextSibling);
      }
      target.removeChild(firstChild);
    }
  }

  function swap(swapMethod, target, fragment, settleInfo, morph) {
    switch (swapMethod) {
      case "none":
        return;
      case "outerHTML":
        swapOuterHTML(target, fragment, settleInfo, morph);
        return;
      case "afterbegin":
        swapAfterBegin(target, fragment, settleInfo);
        return;
      case "beforebegin":
        swapBeforeBegin(target, fragment, settleInfo);
        return;
      case "beforeend":
        swapBeforeEnd(target, fragment, settleInfo);
        return;
      case "afterend":
        swapAfterEnd(target, fragment, settleInfo);
        return;
      default:
        swapInnerHTML(target, fragment, settleInfo);
        return
    }
  }

  Alpine.magic('swap', (el, { Alpine }) => (settings) => {

    let defaultSettings = {
      endpoint: window.location.href,
      select: null,
      target: el,
      swapMethod: 'innerHTML',
      transition: false,
      morph: false,
      settleDelay: 20,
      requestConfig: {},
      onError: (error) => {
        console.error('Alpine Swap: Error fetching HTML', error)
      },
      onSuccess: () => {},
    }

    const {
      endpoint,
      select,
      target,
      swapMethod,
      transition,
      morph,
      settleDelay,
      requestConfig,
      onError,
      onSuccess,
    } = Object.assign(defaultSettings, settings)

    const targetEl = targetElement(target)

    if (!targetEl) {
      throw new Error('Alpine Swap: A selected element or DOM element must be provided as a target.')
    }

    emitEvent('alpineSwap:beforeRequest', targetEl, {
      elt: el,
      target: targetEl,
      requestConfig
    })

    fetchHTML({
      endpoint,
      requestConfig,
      target: targetEl,
      elt: el,
      onError,
    })
      .then((response) => {
        if (!response) return

        const settleInfo = makeSettleInfo(targetEl, settleDelay);

        let fragment = document.createDocumentFragment()
        const selected = selectedElement(select, response)

        forEach(selected, (node) => fragment.appendChild(node.cloneNode(true)))

        emitEvent('alpineSwap:beforeSwap', targetEl, {
          endpoint,
          elt: el,
          select,
          fragment: fragment,
          target: targetEl,
          swapMethod,
          transition,
          morph
        })

        addClass(targetEl, 'alpine-swap-swapping')

        if (transition && document.startViewTransition) {
          document.startViewTransition(() => {
            swap(swapMethod, targetEl, fragment, settleInfo, morph)
            doSettle(settleInfo)
          })
        } else {
          swap(swapMethod, targetEl, fragment, settleInfo, morph)
          doSettle(settleInfo)
        }

        emitEvent('alpineSwap:afterSwap', targetEl, {
          endpoint,
          elt: el,
          select,
          fragment: fragment,
          target: targetEl,
          swapMethod,
          transition,
          morph
        })

        removeClass(targetEl, 'alpine-swap-swapping')

        if (onSuccess) {
          onSuccess();
        }
      });
  })
}
