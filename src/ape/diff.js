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

import { isComponent } from './util'

// Diff
function changed (node1, node2) {
  const strCheck = typeof node1 === 'string' && node1 !== node2
  const nodeCheck = typeof node1 !== typeof node2
  const typeCheck = node1.type !== node2.type
  return typeCheck || strCheck || nodeCheck
}

function diffProps (newNode, oldNode) {
  const patches = []
  const props = Object.assign({}, newNode.props, oldNode.props)
  Object.keys(props).forEach(name => {
    const newVal = newNode.props[name]
    const oldVal = oldNode.props[name]
    if (!newVal) {
      patches.push({ type: REMOVE_PROP, name, value: oldVal })
    }
    if (!oldVal || newVal !== oldVal) {
      patches.push({ type: SET_PROP, name, value: newVal })
    }
  })
  return patches
}

function diffChildren (newNode, oldNode, parentId) {
  let patches = []
  const patchesLength = Math.max(
    newNode.children.length,
    oldNode.children.length
  )
  for (let i = 0; i < patchesLength; i++) {
    const newChild = newNode.children[i]
    const oldChild = oldNode.children[i]

    if (newChild && oldChild && isComponent(newChild) && isComponent(oldChild)) {
      // If components
      newChild.props.id = parentId + '.' + i
      oldChild.props.id = parentId + '.' + i
      const newComp = new newChild.type(newChild.type, newChild.props, newChild.children)
      const oldComp = new oldChild.type(oldChild.type, oldChild.props, oldChild.children)

      const childPatches = diff(newComp.render(), oldComp.render(), parentId) || []
      patches.push(childPatches)
    } else {
      // Treat as html elements
      const d = diff(
        newNode.children[i],
        oldNode.children[i],
        parentId
      )
      if (d) {
        patches.push(d)
      }
    }
  }
  return patches
}

export function diff (newNode, oldNode, parentId) {
  if (!oldNode) {
    return { type: CREATE, newNode }
  }
  if (!newNode) {
    return { type: REMOVE }
  }
  if (changed(newNode, oldNode)) {
    return { type: REPLACE, newNode }
  }
  if (newNode.type) {
    const props = diffProps(newNode, oldNode)
    const children = diffChildren(newNode, oldNode, parentId)
    if (children.length || props.length) {
      return {
        type: UPDATE,
        props,
        children
      }
    } else {
      return {
        type: EMPTY
      }
    }
  }
}
