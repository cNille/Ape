
// Utilities
export const flatten = arr => [].concat.apply([], arr)
export const range = (size) => [...Array(size).keys()]
export const isComponent = (node) => typeof node.type === 'function'
export const e = (type, props, ...children) => {
  props = props || {}
  return {
    children: flatten(children),
    type,
    props
  }
}
