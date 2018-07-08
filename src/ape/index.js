import { diff } from './diff'
import { flatten, e } from './util'
import { createElement, patch } from './patch'

// Types
import {
  CREATE,
  REMOVE,
  REPLACE,
  UPDATE,
  SET_PROP,
  REMOVE_PROP
} from './constants'

// Application
const StateTree = {
}
export class Ape {
  constructor (rootId, app) {
    this.root = document.getElementById(rootId)
    this.root.setAttribute('root', true)
    this.app = app
    this.root.appendChild(createElement(this.app))
  }
}

// Component
export class Component {
  constructor (type, props, ...children) {
    this.props = props || {}
    this.state = {}
    this.setState = this.setState.bind(this)

    this.type = type
    this.children = flatten(children)

    if (StateTree[props.id]) {
      this.state = StateTree[props.id]
      console.log('Loaded state:', this.state)
    } else {
      StateTree[props.id] = this.state
      console.log('Saved state:', this.state)
    }
    return this
  }

  setState (newState) {
    // const oldState = this.state
    const oldElement = this.render()
    this.state = newState
    const newElement = this.render()

    const patches = diff(newElement, oldElement, this.props.id)
    patch(document.getElementById(this.props.id).parentNode, patches)
  }

  render () {
    throw Error('render method should be implemented by subclass.')
  }
}
