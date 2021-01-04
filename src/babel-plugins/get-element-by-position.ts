import { NodePath, types, Visitor } from '@babel/core'

export default class BabelPluginGetElementByPosition {
  data: types.JSXElement | null
  plugin: () => { visitor: Visitor }

  constructor(position: CodeMirror.Position) {
    this.data = null

    this.plugin = () => {
      return {
        visitor: {
          JSXElement: (path: NodePath<types.JSXElement>) => {
            if (!path.node.loc) {
              return
            }

            if (inRange(position, path.node.loc)) {
              this.data = path.node
            }
          },
        },
      }
    }
  }
}

export function inRange(
  position: CodeMirror.Position,
  range: types.SourceLocation,
) {
  // Line numbers in `position` are zero-indexed.
  // Line numbers in `range` are one-indexed.

  if (
    position.line === range.start.line - 1 &&
    position.line === range.end.line - 1
  ) {
    return position.ch >= range.start.column && position.ch <= range.end.column
  }

  if (position.line === range.start.line - 1) {
    return position.ch >= range.start.column
  }

  if (position.line === range.end.line - 1) {
    return position.ch <= range.end.column
  }

  return (
    position.line > range.start.line - 1 && position.line < range.end.line - 1
  )
}
