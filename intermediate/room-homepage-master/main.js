// @ts-check

/**
 * @type {NodeListOf<HTMLLIElement>}
 */
const listDrag = document.querySelectorAll('[draggable="true"]');

// ************************** 1. Events *********************************//

if ("ontouchstart" in document) {
  document.addEventListener("touchstart", touchstart);
  document.addEventListener("touchmove", touchmove);
  document.addEventListener("touchend", touchend);
  document.addEventListener("touchcancel", touchend);
}

listDrag.forEach((elem) => {
  elem.addEventListener('dragstart', dragstart);
  elem.addEventListener('dragover', dragover);
  elem.addEventListener('dragleave', dragleave);
  elem.addEventListener('drop', drop);
});

listDrag[0].addEventListener('click', () => {
  console.log('click');
});

listDrag[0].addEventListener('dblclick', (e) => {
  e.preventDefault();
  console.log('dblclick');
});

/**
 * @param {DragEvent} e 
 */
function dragstart(e) {
  if (e.target) {
    // @ts-ignore
    e.target.classList.add('moving');
    e.target.parentElement.setAttribute('style', 'overflow-y: hidden');
    document.querySelector('body')?.setAttribute('style', 'overflow-y: hidden');
  }
}

/**
 * @param {DragEvent} e 
 */
function dragover(e) {
  e.preventDefault();
  const moving = document.querySelector('.moving');
  if (e.currentTarget && moving && e.currentTarget !== moving) {
    // @ts-ignore
    e.currentTarget.classList.add('over');
  }
}

/**
 * @param {DragEvent} e 
 */
function dragleave(e) {
  const over = document.querySelector('.over');
  if (over) {
    over.classList.remove('over');
  }
}

/**
 * @param {DragEvent} e 
 */
function drop(e) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  e.preventDefault();
  const moving = document.querySelector('.moving');
  const over = document.querySelector('.over');
  if (e.currentTarget && moving && over && moving !== e.currentTarget) {
    moving.classList.remove('moving');
    over.classList.remove('over');
    // @ts-ignore
    swapDom(moving, e.currentTarget);
  }
}

/**
 * Swap element between each over
 * https://stackoverflow.com/questions/9732624/how-to-swap-dom-child-nodes-in-javascript
 * @param {Element} a 
 * @param {Element} b 
 */
function swapDom(a, b) {
  const empty = document.createElement('span');
  a.before(empty);
  b.before(a);
  empty.replaceWith(b);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

/**
 * Pixels to move before drag starts.
 * @type {number}
 */
const THRESHOLD = 5;

/**
 * Opacity of the draggable element.
 * @type {number}
 */
const OPACITY = 0.5;

/**
 * Max ms between clicks in a double click.
 * @type {number}
 */
const DBLCLICK = 500;

/**
 * @typedef {object} Draggable
 * @property {Node|null} draggable Current draggable element.
 * @property {Node|null} origin Source of draggable element.
 * @property {TouchEvent|null} lastTouch
 * @property {EventTarget|null} lastTarget
 * @property {number} lastClick
 * @property {{x:number, y:number}} ptDown Coordinates of the point of first touch.
 * @property {{x:number, y:number}} ptOrigin Coordinates of top left point of the origin element.
 */

/**
 * @type {Draggable}
 */
let dragObj = {
  draggable: null,
  origin: null,
  lastTouch: null,
  lastTarget: null,
  lastClick: 0,
  ptDown: { x: 0, y: 0 },
  ptOrigin: { x: 0, y: 0 },
};

/**
 * @param {TouchEvent} touchEvent 
 */
function touchstart(touchEvent) {
  if (shouldHandle(touchEvent)) {
    // raise double-click and prevent zooming
    if (Date.now() - dragObj.lastClick < DBLCLICK) {
      if (dispatchNewEvent(touchEvent.target, "dblclick", touchEvent) === false) {
        touchEvent.preventDefault();
        reset();
        return;
      }
    }
    reset();
    // @ts-ignore
    const src = closestDraggable(touchEvent.target);
    if (src) {
      // give caller a chance to handle the hover/move events
      if (
        dispatchNewEvent(touchEvent.target, "mousemove", touchEvent) === true &&
        dispatchNewEvent(touchEvent.target, "mousedown", touchEvent) === true
      ) {
        // get ready to start dragging
        dragObj.origin = src;
        dragObj.ptDown = getPoint(touchEvent);
        dragObj.lastTouch = touchEvent;
      }
    }
  }
}

/**
 * @param {TouchEvent} touchEvent 
 */
function touchmove(touchEvent) {
  if (shouldHandle(touchEvent)) {
    // see if target wants to handle move
    const target = getTarget(touchEvent);
    if (dispatchNewEvent(target, "mousemove", touchEvent) === false) {
      dragObj.lastTouch = touchEvent;
      touchEvent.preventDefault();
      return;
    }
    // start dragging
    if (dragObj.origin && dragObj.draggable === null) {
      const delta = getDelta(touchEvent);
      if (delta > THRESHOLD) {
        dispatchNewEvent(dragObj.origin, "dragstart", touchEvent);
        createDraggableElement(touchEvent);
        dispatchNewEvent(target, "dragenter", touchEvent);
      }
    }
    // continue dragging
    if (dragObj.draggable) {
      dragObj.lastTouch = touchEvent;
      if (target != dragObj.lastTarget) {
        dispatchNewEvent(dragObj.lastTarget, "dragleave", dragObj.lastTouch);
        dispatchNewEvent(target, "dragenter", touchEvent);
        dragObj.lastTarget = target;
      }
      moveDraggableElement(touchEvent);
      dispatchNewEvent(target, "dragover", touchEvent);
    }
  }
}

/**
 * @param {TouchEvent} touchEvent 
 * @returns 
 */
function touchend(touchEvent) {
  if (shouldHandle(touchEvent)) {
    // see if target wants to handle up
    if (dispatchNewEvent(touchEvent.target, "mouseup", dragObj.lastTouch) === false) {
      touchEvent.preventDefault();
      return;
    }
    // user clicked the element but didn't drag, so clear the source and simulate a click
    if (dragObj.draggable === null) {
      dragObj.origin = null;
      dragObj.lastClick = Date.now();
    }
    // finish dragging
    removeDraggableElementFromDOM();
    if (dragObj.origin) {
      if (touchEvent.type.indexOf("cancel") < 0) {
        dispatchNewEvent(dragObj.lastTarget, "drop", dragObj.lastTouch);
      }
      dispatchNewEvent(dragObj.origin, "dragend", dragObj.lastTouch);
      reset();
    }
  }
}

// ************************* 2. Functions *******************************//

/**
 * Dispatches a synthetic event to `target` 
 * and returns true if either event's cancelable attribute value is false 
 * or its preventDefault() method was not invoked, and false otherwise. 
 * 
 * @param {EventTarget|null} target
 * @param {string} type Type of new Event.
 * @param {TouchEvent|null} event Original TouchEvent required to copy some props.
 */
function dispatchNewEvent(target, type, event) {
  if (target && event) {
    const newEvent = new Event(type, { bubbles: true, cancelable: true });
    // @ts-ignore
    newEvent.button = 0;
    // @ts-ignore
    newEvent.buttons = 1;
    copyProps(event, newEvent, ["altKey", "ctrlKey", "metaKey", "shiftKey"]);
    copyProps(event.touches[0], newEvent, ['pageX', 'pageY', 'clientX', 'clientY', 'screenX', 'screenY']);
    return target.dispatchEvent(newEvent);
  }
  return true;
}

/**
 * @param {TouchEvent} touchEvent 
 */
function createDraggableElement(touchEvent) {
  // just in case...
  if (dragObj.draggable) {
    removeDraggableElementFromDOM();
  }
  // create draggable from origin
  if (dragObj.origin) {
    dragObj.draggable = dragObj.origin.cloneNode(true);
    copyStyle(dragObj.origin, dragObj.draggable);
    // @ts-ignore
    const st = dragObj.draggable.style;
    st.top = "-9999px";
    st.left = "-9999px";
    st.position = "absolute";
    st.zIndex = "999999";
    st.opacity = OPACITY.toString();

    // count top left point of the origin element
    // @ts-ignore
    const rc = dragObj.origin.getBoundingClientRect();
    const pt = getPoint(touchEvent);
    dragObj.ptOrigin = { x: pt.x - rc.left, y: pt.y - rc.top };

    moveDraggableElement(touchEvent);
    // add draggable to document
    document.body.appendChild(dragObj.draggable);
  }
}

function removeDraggableElementFromDOM() {
  if (dragObj.draggable && dragObj.draggable.parentElement) {
    dragObj.draggable.parentElement.removeChild(dragObj.draggable);
  }
  dragObj.draggable = null;
}

/**
 * @param {TouchEvent} touchEvent 
 */
function moveDraggableElement(touchEvent) {
  requestAnimationFrame(() => {
    const pt = getPoint(touchEvent, true);
    if (dragObj.draggable) {
      // @ts-ignore
      dragObj.draggable.style.left = Math.round(pt.x - dragObj.ptOrigin.x) + 'px';
      // @ts-ignore
      dragObj.draggable.style.top = Math.round(pt.y - dragObj.ptOrigin.y) + 'px';
    }
  });
}

/**
 * Ignore events that have been handled or that involve more than one touch.
 * @param {TouchEvent} touchEvent 
 */
function shouldHandle(touchEvent) {
  return touchEvent.defaultPrevented === false &&
    touchEvent.touches &&
    touchEvent.touches.length < 2;
}

/**
 * Clear all members of `DragObj`.
 */
function reset() {
  removeDraggableElementFromDOM();
  dragObj.origin = null;
  dragObj.lastTouch = null;
  dragObj.lastTarget = null;
  dragObj.lastClick = 0;
  dragObj.ptDown = { x: 0, y: 0 };
  dragObj.ptOrigin = { x: 0, y: 0 };
}

/**
 * Get point for a touch event.
 * @param {TouchEvent|null} touchEvent 
 * @param {boolean} page
 * @returns {{x:number, y:number}}
 */
function getPoint(touchEvent, page = false) {
  if (touchEvent && touchEvent.touches) {
    const t = touchEvent.touches[0];
    return {
      x: page ? t.pageX : t.clientX,
      y: page ? t.pageY : t.clientY
    };
  }
  return { x: 0, y: 0 };
}

/**
 * Get distance between the current touch event and the first one.
 * @param {TouchEvent} touchEvent 
 */
function getDelta(touchEvent) {
  const pt = getPoint(touchEvent);
  return Math.abs(pt.x - dragObj.ptDown.x) + Math.abs(pt.y - dragObj.ptDown.y);
}

/**
 * Get the element at a given touch event.
 * @param {TouchEvent} touchEvent 
 */
function getTarget(touchEvent) {
  const pt = getPoint(touchEvent);
  const el = document.elementFromPoint(pt.x, pt.y);
  if (el && getComputedStyle(el).pointerEvents === "none") {
    return el.parentElement;
  }
  return el;
}

/**
 * Copy properties from an object to another
 * @param {*} src From where we copy (source). 
 * @param {*} dst Where do we copy (destination). 
 * @param {string[]} props 
 */
function copyProps(src, dst, props) {
  for (let i = 0; i < props.length; i++) {
    const p = props[i];
    dst[p] = src[p];
  }
}

/**
 * Copy style properties from an object to another
 * @param {*} src From where we copy (source).
 * @param {*} dst Where do we copy (destination).
 */
function copyStyle(src, dst) {
  // remove potentially troublesome attributes
  ['id', 'class', 'style', 'draggable'].forEach((att) => {
    dst.removeAttribute(att);
  });
  // copy canvas content
  if (src instanceof HTMLCanvasElement) {
    let cSrc = src;
    let cDst = dst;
    cDst.width = cSrc.width;
    cDst.height = cSrc.height;
    cDst.getContext("2d").drawImage(cSrc, 0, 0);
  }
  const srcStyle = getComputedStyle(src);
  // copy style
  copyProps(srcStyle, dst.style, [...srcStyle]);
  dst.style.pointerEvents = "none";
  // and repeat for all children
  for (let i = 0; i < src.children.length; i++) {
    copyStyle(src.children[i], dst.children[i]);
  }
}

/**
 * Gets an element's closest draggable ancestor.
 * @param {HTMLElement|null} element
 */
function closestDraggable(element) {
  while (element) {
    if (element.hasAttribute('draggable')) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}