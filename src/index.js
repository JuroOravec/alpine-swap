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

  function swapOuterHTML(target, fragment, onSettleCallback) {
    if (target.tagName === "BODY") {
      return swapInnerHTML(target, fragment, onSettleCallback);
    } else {
      // @type {HTMLElement}
  
      if (Alpine.morph) {
        Alpine.morph(target, fragment)
      } else {
        target.replaceWith(fragment)
      }
    }
  
    return onSettleCallback()
  }
  
  function swapAfterBegin(target, fragment, onSettleCallback) {
    insertNodesBefore(target, target.firstChild, fragment)
    return onSettleCallback()
  }
  
  function swapBeforeBegin(target, fragment, onSettleCallback) {
    insertNodesBefore(target.parentElement, target, fragment)
    return onSettleCallback()
  }
  
  function swapBeforeEnd(target, fragment, onSettleCallback) {
    insertNodesBefore(target, null, fragment);
    return onSettleCallback()
  }
  
  function swapAfterEnd(target, fragment, onSettleCallback) {
    insertNodesBefore(target.parentElement, target.nextSibling, fragment);
    return onSettleCallback()
  }
  
  function swapInnerHTML(target, fragment, onSettleCallback) {
    var firstChild = target.firstChild;
    insertNodesBefore(target, target.firstChild, fragment.firstChild);
  
    if (firstChild) {
      while (firstChild.nextSibling) {
        target.removeChild(firstChild.nextSibling);
      }
      target.removeChild(firstChild);
    }
  
    onSettleCallback();
  }

  function swap(swapStyle, target, fragment, onSettleCallback) {
    switch (swapStyle) {
      case "none":
        return;
      case "outerHTML":
        swapOuterHTML(target, fragment, onSettleCallback);
        return;
      case "afterbegin":
        swapAfterBegin(target, fragment, onSettleCallback);
        return;
      case "beforebegin":
        swapBeforeBegin(target, fragment, onSettleCallback);
        return;
      case "beforeend":
        swapBeforeEnd(target, fragment, onSettleCallback);
        return;
      case "afterend":
        swapAfterEnd(target, fragment, onSettleCallback);
        return;
      default:
        swapInnerHTML(target, fragment, onSettleCallback);
        return
    }
  }

  Alpine.magic('swap', (el, { Alpine }) => (endpoint, select, target, swapStyle = 'innerHTML', onSettleCallback = () => { }) => {
    endpoint = endpoint || window.location.href
    target = target ? document.querySelector(target) : el

    fetchHTML(endpoint).then((response) => {
      let fragment = document.createDocumentFragment()
      const selected = select && response.querySelectorAll(select) ? response.querySelectorAll(select) : response.body

      selected.forEach((node) => {
        fragment.appendChild(node.cloneNode(true))
      })

      swap(swapStyle, target, fragment, onSettleCallback)
    })
  })
}