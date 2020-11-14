// @ts-ignore
import babelPluginTransformJsx from '@babel/plugin-transform-react-jsx'
import { transform } from '@babel/standalone'
import React from 'react'
import { assign, Machine } from 'xstate'
import jsx from './jsx'

type AppEvent =
  | { type: 'CODE_CHANGE'; value: string }
  | { type: 'ERROR'; message: string }

interface AppContext {
  code: string
  element?: JSX.Element
  error: string
}

export default Machine<AppContext, AppEvent>(
  {
    id: 'app',
    initial: 'evaluatingCode',
    context: {
      code: '',
      error: '',
    },
    states: {
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
            target: 'idle',
            actions: assign({ error: (context, event) => event.data.message }),
          },
        },
      },
      idle: {
        on: {
          CODE_CHANGE: {
            target: 'evaluatingCode',
            actions: assign({ code: (context, event) => event.value }),
          },
          ERROR: {
            actions: assign({ error: (context, event) => event.message }),
          },
        },
      },
    },
  },
  {
    services: {
      async evaluateCode(context) {
        const transformedCode = transform(`<>${context.code.trim()}</>`, {
          plugins: [[babelPluginTransformJsx, { pragma: 'jsx' }]],
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
