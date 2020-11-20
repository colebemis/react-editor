import { NodePath, types } from '@babel/core'
import template from '@babel/template'

export default function babelPluginWrapElements({
  types: t,
}: {
  types: typeof types
}) {
  function isWrapper(node: types.Node) {
    return (
      t.isJSXElement(node) &&
      t.isJSXIdentifier(node.openingElement.name) &&
      node.openingElement.name.name === 'Wrapper'
    )
  }

  return {
    visitor: {
      JSXElement: {
        exit: (path: NodePath<types.JSXElement>) => {
          if (isWrapper(path.node) || isWrapper(path.parent)) {
            return
          }

          const wrapperOpeningElement = t.jsxOpeningElement(
            t.jsxIdentifier('Wrapper'),
            path.node.openingElement.attributes,
          )

          path.node.openingElement.attributes = []

          const wrapperClosingElement = t.jsxClosingElement(
            t.jsxIdentifier('Wrapper'),
          )

          if (path.node.loc) {
            const { start, end } = path.node.loc

            const locationAttribute = t.jsxAttribute(
              t.jsxIdentifier('__location'),
              t.jsxExpressionContainer(
                template.expression(
                  `{ start: { line: ${start.line}, column: ${start.column} }, end: { line: ${end.line}, column: ${end.column} } }`,
                )(),
              ),
            )

            wrapperOpeningElement.attributes.push(locationAttribute)
          }

          path.replaceWith(
            t.jsxElement(wrapperOpeningElement, wrapperClosingElement, [
              path.node,
            ]),
          )
        },
      },
    },
  }
}
