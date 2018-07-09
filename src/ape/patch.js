// Types
import {
  CREATE,
  REMOVE,
  REPLACE,
  UPDATE,
  EMPTY,
  SET_PROP,
  REMOVE_PROP
} from './constants'

// Handle eventlisteners
var _eventHandlers = {} // somewhere global

function addListener (node, event, handler, capture) {
  if (!(node in _eventHandlers)) {
    _eventHandlers[node] = {}
  }
  if (!(event in _eventHandlers[node])) {
    _eventHandlers[node][event] = []
  }
  _eventHandlers[node][event].push([handler, capture])
  node.addEventListener(event, handler, capture)
}
function removeAllListeners (node, event) {
  if (node in _eventHandlers) {
    const handlers = _eventHandlers[node]
    if (event in handlers) {
      const eventHandlers = handlers[event]
      for (let i = eventHandlers.length; i--;) {
        const handler = eventHandlers[i]
        node.removeEventListener(event, handler[0], handler[1])
      }
    }
  }
}

// Patch
export function createElement (node, id = '1') {
  // Handle component
  const isComponent = typeof node.type === 'function'
  if (isComponent) {
    node.props.id = id
    const component = new node.type(node.type, node.props, node.children)
    return createElement(component.render(), id)
  } else if (typeof node === 'string') {
    return document.createTextNode(node)
  } else {
    const element = document.createElement(node.type, id)
    setProp(element, 'id', id)
    setProps(element, node.props)
    node.children
      .map((child, idx) => {
        return createElement(child, id + '.' + idx)
      })
      .forEach(element.appendChild.bind(element))
    return element
  }
}

function setProp (target, name, value) {
  if (name === 'className') {
    return target.setAttribute('class', value)
  }
  if (typeof value === 'function') {
    removeAllListeners(target, name)
    return addListener(target, name, value)
  }
  return target.setAttribute(name, value)
}

function setProps (target, props) {
  Object.keys(props).forEach(name => {
    setProp(target, name, props[name])
  })
}

function removeProp (target, name, value) {
  if (name === 'className') {
    return target.removeAttribute('class')
  }
  return target.removeAttribute(name)
}

function patchProps (element, patches) {
  for (let i = 0; i < patches.length; i++) {
    const propPatch = patches[i]
    const {type, name, value} = propPatch
    if (type === SET_PROP) {
      setProp(element, name, value)
    }
    if (type === REMOVE_PROP) {
      removeProp(element, name, value)
    }
  }
}

export function patch (parent, patches, index = 0) {
  if (!patches) return

  if (!parent) {
    console.log('no parent')
  }
  const element = parent.childNodes[index]
  if (!element) {
    console.log('no element')
  }
  if (patches.type !== EMPTY) {
    console.log(patches.type, element)
  }
  switch (patches.type) {
    case EMPTY: {
      return
    }
    case CREATE: {
      const {newNode} = patches
      const newElement = createElement(newNode, parent.id + '.' + index)
      return parent.append(newElement)
    }
    case REMOVE: {
      return parent.removeChild(element)
    }
    case REPLACE: {
      const { newNode } = patches
      const newElement = createElement(newNode, parent.id + '.' + index)
      return parent.replaceChild(newElement, element)
    }
    case UPDATE: {
      const { props, children } = patches
      patchProps(element, props)

      for (let i = 0; i < children.length; i++) {
        if (!children[i]) {
          console.log('errer')
        }
        patch(element, children[i], i)
      }
    }
  }
}