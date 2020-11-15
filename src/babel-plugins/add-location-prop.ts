import { NodePath, types } from '@babel/core'

export default function addLocProp({ types: t }: { types: typeof types }) {
  return {
    visitor: {
      JSXElement(path: NodePath<types.JSXElement>) {
        if (!path.node.loc) {
          return
        }

        const { start, end } = path.node.loc

        const locationAttribute = t.jsxAttribute(
          t.jsxIdentifier('__location'),
          t.jsxExpressionContainer(
            t.objectExpression([
              t.objectProperty(
                t.identifier('start'),
                t.objectExpression([
                  t.objectProperty(
                    t.identifier('line'),
                    t.numericLiteral(start.line),
                  ),
                  t.objectProperty(
                    t.identifier('column'),
                    t.numericLiteral(start.column),
                  ),
                ]),
              ),
              t.objectProperty(
                t.identifier('end'),
                t.objectExpression([
                  t.objectProperty(
                    t.identifier('line'),
                    t.numericLiteral(end.line),
                  ),
                  t.objectProperty(
                    t.identifier('column'),
                    t.numericLiteral(end.column),
                  ),
                ]),
              ),
            ]),
          ),
        )

        path.node.openingElement.attributes.push(locationAttribute)
      },
    },
  }
}
