import { types } from '@babel/core'
// @ts-ignore
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
// @ts-ignore
import babelPluginTransformJsx from '@babel/plugin-transform-react-jsx'
import { transform } from '@babel/standalone'
import { assign, Machine } from 'xstate'
import BabelPluginGetElementByPosition from './babel-plugins/get-element-by-position'
import babelPluginWrapElements from './babel-plugins/wrap-elements'

export interface EditorContext {
  code: string
  transformedCode?: string
  selectedElementLocation?: types.SourceLocation | null
  error: string
}

export type EditorEvent =
  | { type: 'CODE_CHANGE'; value: string }
  | { type: 'CURSOR'; position: CodeMirror.Position }
  | { type: 'SELECT_ELEMENT'; location: types.SourceLocation }
  | { type: 'ERROR'; message: string }

export default Machine<EditorContext, EditorEvent>(
  {
    id: 'editor',
    initial: 'evaluatingCode',
    context: {
      code: '',
      error: '',
    },
    on: {
      CURSOR: {
        actions: assign({
          selectedElementLocation: (context, event) =>
            getElementByPosition(context.code, event.position)?.loc,
        }),
      },
    },
    states: {
      idle: {
        on: {
          CODE_CHANGE: {
            target: 'debouncing',
            actions: assign({ code: (context, event) => event.value }),
          },
          ERROR: {
            target: 'error',
            actions: assign({ error: (context, event) => event.message }),
          },
          SELECT_ELEMENT: {
            actions: assign({
              selectedElementLocation: (context, event) => event.location,
            }),
          },
        },
      },
      debouncing: {
        on: {
          CODE_CHANGE: {
            target: 'debouncing',
            actions: assign({ code: (context, event) => event.value }),
          },
        },
        after: {
          400: 'evaluatingCode',
        },
      },
      evaluatingCode: {
        invoke: {
          id: 'transformCode',
          src: 'transformCode',
          onDone: {
            target: 'idle',
            actions: assign({
              transformedCode: (context, event) => event.data,
              error: (context, event) => '',
            }),
          },
          onError: {
            target: 'error',
            actions: assign({ error: (context, event) => event.data.message }),
          },
        },
      },
      error: {
        on: {
          CODE_CHANGE: {
            target: 'debouncing',
            actions: assign({ code: (context, event) => event.value }),
          },
        },
      },
    },
  },
  {
    services: {
      async transformCode(context) {
        const transformedCode = transform(context.code, {
          plugins: [babelPluginWrapElements, [babelPluginTransformJsx]],
        }).code
        // Remove trailing semicolon to convert the transformed code into an expression.
        return transformedCode?.trim().replace(/;$/, '')
      },
    },
  },
)

function getElementByPosition(code: string, position: CodeMirror.Position) {
  try {
    const babelPluginGetElementByPosition = new BabelPluginGetElementByPosition(
      position,
    )

    transform(code, {
      plugins: [babelPluginSyntaxJsx, babelPluginGetElementByPosition.plugin],
    })

    return babelPluginGetElementByPosition.data
  } catch (error) {
    return null
  }
}
