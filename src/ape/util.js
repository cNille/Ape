// Utilities
export const flatten = arr => [].concat.apply([], arr);
export const range = size => [...Array(size).keys()];
export const isComponent = node => typeof node.type === "function";

// A function for handling both component classes and functions.
export const componentRender = (component, node) => {
  if (typeof component.render !== "function") {
    return node.type(node.props);
  }
  return component.render();
};
