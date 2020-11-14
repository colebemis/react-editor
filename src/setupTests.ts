// jest-dom adds custom jest matchers for asserting on DOM nodes.
// Reference: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// `createRange` is not defined in JSDOM but CodeMirror relies on it, so we need to polyfill it.
// Reference: https://discuss.codemirror.net/t/working-in-jsdom-or-node-js-natively/138/8
// @ts-ignore
Document.prototype.createRange = function () {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }),
    getClientRects: () => ({ length: 0 }),
  }
}
