// Types
const CREATE = 'CREATE';
const REMOVE = 'REMOVE';
const REPLACE = 'REPLACE';
const UPDATE = 'UPDATE';
const SET_PROP = 'SET_PROP';
const REMOVE_PROP = 'REMOVE_PROP';

// Utilities
const flatten = arr => [].concat.apply([], arr);
const range = size => [...Array(size).keys()];
const e = (type, props, ...children) => {
  props = props || {};
  return {
    children: flatten(children),
    type,
    props
  };
};

// Application
const Tree = {};
class App {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    setProp(this.root, 'root');
    this.render = this.render.bind(this);
    this.root.appendChild(createElement(this.render()));
  }
  render() {
    return e(Container, null);
  }
}

// Component
class Component {
  constructor(type, props, ...children) {
    this.props = props || {};
    this.state = {};
    this.setState = this.setState.bind(this);

    this.type = type;
    this.children = flatten(children);
    Tree[props.id] = this;
    return this;
  }

  setState(newState) {
    const newElement = this.render(this.state);
    const oldElement = this.render(newState);
    const patches = diff(newElement, oldElement);
    patch(this, patches);
  }

  render() {
    throw Error('render method should be implemented by subclass.');
  }
}

// function update (element, count) {
//   const patches = diff(view(count + 1), view(count))
//   console.log('Nbr of patches: ' + patches.length)
//
//   console.log('Element', element)
//   patch(element, patches, 0)
//
//   console.log(count, patches)
// }

class Container extends Component {
  constructor(type, props, ...children) {
    super(type, props, ...children);

    this.state = {
      count: 10
    };
    this.update = this.update.bind(this);
    return this;
  }
  update(count) {
    this.setState({ count });
  }
  render() {
    // @
    const { count } = this.state;
    return e(
      'section',
      null,
      e(
        'button',
        { click: () => this.update(count + 1) },
        'Click'
      ),
      e(List, { count: count })
    );
  }
}
class List extends Component {
  render() {
    // @
    const { count } = this.props;
    const r = range(count);
    const list = r.map(n => e(
      'li',
      null,
      (count * n).toString()
    ));
    return e(
      'ul',
      { className: `color-${count % 3}` },
      list
    );
  }
}

// Patch

function createElement(node, id = '1') {
  // Handle component
  const isComponent = typeof node.type === 'function';
  if (isComponent) {
    node.props.id = id;
    const component = new node.type(node.type, node.props, node.children);
    return createElement(component.render(), id);
  } else if (typeof node === 'string') {
    return document.createTextNode(node);
  } else {
    const element = document.createElement(node.type);
    setProp(element, 'id', id);
    setProps(element, node.props);
    node.children.map((child, idx) => {
      return createElement(child, id + '.' + idx);
    }).forEach(element.appendChild.bind(element));
    return element;
  }
}

function setProp(target, name, value) {
  if (name === 'className') {
    return target.setAttribute('class', value);
  }
  if (typeof value === 'function') {
    return target.addEventListener(name, value);
  }
  target.setAttribute(name, value);
}

function setProps(target, props) {
  Object.keys(props).forEach(name => {
    setProp(target, name, props[name]);
  });
}

function removeProp(target, name, value) {
  if (name === 'className') {
    return target.removeAttribute('class');
  }
  target.removeAttribute(name);
}

function patchProps(element, patches) {
  for (let i = 0; i < patches.length; i++) {
    const propPatch = patches[i];
    const { type, name, value } = propPatch;
    if (type === SET_PROP) {
      setProp(element, name, value);
    }
    if (type === REMOVE_PROP) {
      removeProp(element, name, value);
    }
  }
}

function patch(parent, patches, index = 0) {
  if (!patches) return;

  // if (!element && patches.type === UPDATE) {
  // }
  if (!parent) {
    console.log(2);
  }
  const element = parent.childNodes[index];
  if (!element) {
    console.log('no element');
  }
  switch (patches.type) {
    case CREATE:
      {
        const { newNode } = patches;
        const newElement = createElement(newNode);
        return parent.append(newElement);
      }
    case REMOVE:
      {
        return parent.removeChild(element);
      }
    case REPLACE:
      {
        const { newNode } = patches;
        const newElement = createElement(newNode);
        return parent.replaceChild(newElement, element);
      }
    case UPDATE:
      {
        const { props, children } = patches;
        if (!children) {
          return console.log(patches);
        }
        patchProps(element, props);
        for (let i = 0; i < children.length; i++) {
          if (!children[i]) {
            console.log(i, element, parent);
            console.log('errer');
          }
          patch(element, children[i], i);
        }
      }
  }
}

// Diff
function changed(node1, node2) {
  const strCheck = typeof node1 === 'string' && node1 !== node2;
  const nodeCheck = typeof node1 !== typeof node2;
  const typeCheck = node1.type !== node2.type;
  return typeCheck || strCheck || nodeCheck;
}

function diffProps(newNode, oldNode) {
  const patches = [];
  const props = Object.assign({}, newNode.props, oldNode.props);
  Object.keys(props).forEach(name => {
    const newVal = newNode.props[name];
    const oldVal = oldNode.props[name];
    if (!newVal) {
      patches.push({ type: REMOVE_PROP, name, value: oldVal });
    }
    if (!oldVal || newVal !== oldVal) {
      patches.push({ type: SET_PROP, name, value: newVal });
    }
  });
  return patches;
}

function diffChildren(newNode, oldNode) {
  const patches = [];
  const patchesLength = Math.max(newNode.children.length, oldNode.children.length);
  for (let i = 0; i < patchesLength; i++) {
    patches[i] = diff(newNode.children[i], oldNode.children[i]);
  }
  return patches;
}

function diff(newNode, oldNode) {
  if (!oldNode) {
    return { type: CREATE, newNode };
  }
  if (!newNode) {
    return { type: REMOVE };
  }
  if (changed(newNode, oldNode)) {
    return { type: REPLACE, newNode };
  }
  if (newNode.type) {
    return {
      type: UPDATE,
      props: diffProps(newNode, oldNode),
      children: diffChildren(newNode, oldNode)
    };
  }
}
