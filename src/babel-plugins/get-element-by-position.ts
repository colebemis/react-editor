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

            // console.lsog(position, path.node.loc)

            if (inRange(position, path.node.loc)) {
              this.data = path.node
            }
          },
        },
      }
    }
  }
}

function inRange(
  position: CodeMirror.Position,
  location: types.SourceLocation,
) {
  // Line numbers in `position` are zero-indexed.
  // Line numbers in `location` are one-indexed.
  if (
    position.line >= location.start.line - 1 &&
    position.ch >= location.start.column &&
    position.line <= location.end.line - 1 &&
    position.ch <= location.end.column
  ) {
    return true
  }

  return false
}
