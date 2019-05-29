import { diff } from './diff'
import { flatten } from './util'
import { createElement, patch, runDidMount } from './patch'

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

    // Run all "component.componentDidMount" callbacks
    // produced in creating the element.
    runDidMount()
  }

  static element(type, props, ...children){
    props = props || {}
    return {
      children: flatten(children),
      type,
      props
    }
  }
}

// Component
export class Component {
  constructor (type, props, ...children) {
    this.props = props || {}
    this.state = {}
    this.setState = this.setState.bind(this)
    this.componentWillMount = this.componentWillMount.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)

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

  // Skeleton functions of lifecycle methods
  componentWillMount() { console.log("Will mount: " + this.props.id) }
  componentDidMount() { console.log("Did mount: " + this.props.id) }

  setState (newState) {
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
