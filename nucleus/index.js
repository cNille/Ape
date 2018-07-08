const CREATE = 'CREATE'
const REMOVE = 'REMOVE'
const REPLACE = 'REPLACE'
const UPDATE = 'UPDATE'
const SET_PROP = 'SET_PROP'
const REMOVE_PROP = 'REMOVE_PROP'

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
      patches.push({ type: REMOVE_PROP, name, value: oldVal})
    }
    if (!oldVal || newVal !== oldVal) {
      patches.push({ type: SET_PROP, name, value: newVal})
    }
  })
  return patches
}

function diffChildren (newNode, oldNode) {
  const patches = []
  const patchesLength = Math.max(
    newNode.children.length,
    oldNode.children.length
  )
  for (let i = 0; i < patchesLength; i++) {
    patches[i] = diff(
      newNode.children[i],
      oldNode.children[i]
    )
  }
  return patches
}

function diff (newNode, oldNode) {
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
    return {
      type: UPDATE,
      props: diffProps(newNode, oldNode),
      children: diffChildren(newNode, oldNode)
    }
  }
}

// Patch

function createElement (node) {
  if (typeof node === 'string') {
    return document.createTextNode(node)
  }
  const element = document.createElement(node.type)
  setProps(element, node.props)
  node.children
    .map(createElement)
    .forEach(element.appendChild.bind(element))
  return element
}

function setProp (target, name, value) {
  if (name === 'className') {
    return target.setAttribute('class', value)
  }
  target.setAttribute(name, value)
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
  target.removeAttribute(name)
}

function patchProps (parent, patches) {
  for (let i = 0; i < patches.length; i++) {
    const propPatch = patches[i]
    const {type, name, value} = propPatch
    if (type === SET_PROP) {
      setProp(parent, name, value)
    }
    if (type === REMOVE_PROP) {
      removeProp(parent, name, value)
    }
  }
}

function patch (root, patches, index = 0) {
  if (!patches) return

  const element = root.childNodes[index]
  switch (patches.type) {
    case CREATE: {
      const {newNode} = patches
      const newElement = createElement(newNode)
      return root.append(newElement)
    }
    case REMOVE: {
      console.log(root)
      return root.removeChild(element)
    }
    case REPLACE: {
      const { newNode } = patches
      const newElement = createElement(newNode)
      return root.replaceChild(newElement, element)
    }
    case UPDATE: {
      const { props, children } = patches
      if (!children) {
        return console.log(patches)
      }
      patchProps(element, props)
      for (let i = 0; i < children.length; i++) {
        patch(element, children[i], i)
      }
    }
  }
}

// Component

class Component {
  constructor (type, props, ...children) {
    this.props = props || {}
    this.state = {}

    this.setState = this.setState.bind(this)
    this.update = this.update.bind(this)

    this.type = type
    this.children = flatten(children)
    return { type, props, children: flatten(children) }
  }

  setState (newState) {
    const newView = this.render(this.state)
    const oldView = this.render(newState)
    update(oldView, newView)
    createElement(this.render())
  }

  render () {
    return null
  }

  update (oldElement, newElement) {
    const patches = diff(newElement, oldElement)
    patch(oldElement, patches)
  }
}

// Application

const flatten = arr => [].concat.apply([], arr)
const range = (size) => [...Array(size).keys()]

function e (type, props, ...children) {
  props = props || {}
  return { type, props, children: flatten(children) }
}

class App extends Component {
  render () { // @
    const count = this.state.count || 0

    // Smart range function...
    const r = range(count)

    const list = r.map(n => <li>{ (count * n).toString() }</li>)
    return (
      <ul id='mylist' className={`color-${count % 3}`}>
        <button onClick={() => this.setState({ count: count + 1 })} />
        { list }
      </ul>
    )
  }
}
class List extends Component {
  render () { // @
    const count = this.state.count || 0

    // Smart range function...
    const r = range(count)

    const list = r.map(n => <li>{ (count * n).toString() }</li>)
    return (
      <ul id='mylist' className={`color-${count % 3}`}>
        <button onClick={() => this.setState({ count: count + 1 })} />
        { list }
      </ul>
    )
  }
}

function view (count) { // @
  // Smart range function...
  const r = [...Array(count).keys()]
  const list = r.map(n => <li>{ (count * n).toString() }</li>)
  return (
    <ul id='mylist' className={`color-${count % 3}`}>
      <button onClick={() => update(count + 1)} />
      { list }
    </ul>
  )
}

function update (element, count) {
  const patches = diff(view(count + 1), view(count))
  console.log('Nbr of patches: ' + patches.length)

  patch(element, patches)

  console.log(count, patches)
  if (count > 20) return

  setTimeout(() => update(element, count + 1), 1000)
}

function render (app) { // @
  app.appendChild(createElement(view(0)))
  // app.append(<List count={5} />)
}
