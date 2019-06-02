// Utilities
export const flatten = arr => [].concat.apply([], arr);
export const range = size => [...Array(size).keys()];
export const isComponent = node => typeof node.type === "function";
