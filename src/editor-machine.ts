import { types } from '@babel/core'
// @ts-ignore
import babelPluginTransformJsx from '@babel/plugin-transform-react-jsx'
import { transform } from '@babel/standalone'
import React from 'react'
import { assign, Machine } from 'xstate'
import babelPluginAddLocationProp from './babel-plugins/add-location-prop'
import jsx from './jsx'

export interface EditorContext {
  code: string
  element?: JSX.Element
  cursorPosition?: CodeMirror.Position
  selectedElementLocation: types.SourceLocation | null
  error: string
}

export type EditorEvent =
  | { type: 'CODE_CHANGE'; value: string }
  | { type: 'CURSOR'; position: CodeMirror.Position }
  | { type: 'ERROR'; message: string }

export default Machine<EditorContext, EditorEvent>(
  {
    id: 'editor',
    initial: 'evaluatingCode',
    context: {
      code: '',
      selectedElementLocation: {
        start: { line: 2, column: 2 },
        end: { line: 2, column: 44 },
      },
      error: '',
    },
    on: {
      CURSOR: {
        actions: assign({
          cursorPosition: (context, event) => event.position,
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
          id: 'evaluateCode',
          src: 'evaluateCode',
          onDone: {
            target: 'idle',
            actions: assign({
              element: (context, event) => event.data,
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
      async evaluateCode(context) {
        const transformedCode = transform(`<>${context.code.trim()}</>`, {
          plugins: [
            babelPluginAddLocationProp,
            [babelPluginTransformJsx, { pragma: 'jsx' }],
          ],
        }).code
        // Remove trailing semicolon to convert the transformed code into an expression.
        const expression = transformedCode?.trim().replace(/;$/, '')
        const scope = { React, jsx }
        // eslint-disable-next-line no-new-func
        const fn = new Function(...Object.keys(scope), `return (${expression})`)
        const element: JSX.Element = fn(...Object.values(scope))
        return element
      },
    },
  },
)