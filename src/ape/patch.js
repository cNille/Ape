// Types
import {
  CREATE,
  REMOVE,
  REPLACE,
  UPDATE,
  SET_PROP,
  REMOVE_PROP
} from './constants'

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
    return target.addEventListener(name, value)
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

  // if (!element && patches.type === UPDATE) {
  // }
  if (!parent) {
    console.log('no parent')
  }
  const element = parent.childNodes[index]
  if (!element) {
    console.log('no element')
  }
  console.log(patches.type, element)
  switch (patches.type) {
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
