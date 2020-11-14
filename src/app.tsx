// @ts-ignore
import babelPluginTransformJsx from '@babel/plugin-transform-react-jsx'
import { transform } from '@babel/standalone'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/jsx/jsx'
import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { ErrorBoundary } from 'react-error-boundary'
import './codemirror.css'
import jsx from './jsx'
import { useMachine } from '@xstate/react'
import appMachine from './app-machine'

interface AppProps {
  initialCode: string
}

export default function App({ initialCode }: AppProps) {
  const [state, send] = useMachine(appMachine, {
    context: { code: initialCode },
    devTools: process.env.NODE_ENV !== 'production',
  })
  // const [code, setCode] = React.useState(initialCode)
  const [error, setError] = React.useState('')
  const [element, setElement] = React.useState<JSX.Element>()
  const [cursorPosition, setCursorPosition] = React.useState<
    CodeMirror.Position
  >()

  React.useEffect(() => {
    try {
      const transformedCode = transform(`<>${state.context.code.trim()}</>`, {
        plugins: [[babelPluginTransformJsx, { pragma: 'jsx' }]],
      }).code
      // Remove trailing semicolon to convert the transformed code into an expression.
      const expression = transformedCode?.trim().replace(/;$/, '')
      const scope = { React, jsx }
      // eslint-disable-next-line no-new-func
      const fn = new Function(...Object.keys(scope), `return (${expression})`)
      const element: JSX.Element = fn(...Object.values(scope))

      setElement(element)
      setError('')
    } catch (error) {
      setError(error.message)
    }
  }, [state.context.code])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        gridGap: 1,
        backgroundColor: 'lightgray',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <CodeMirror
          value={state.context.code}
          onBeforeChange={(editor, data, value) =>
            send({ type: 'CODE_CHANGE', value })
          }
          onCursor={(editor) => setCursorPosition(editor.getCursor())}
          options={{
            mode: 'jsx',
            lineNumbers: true,
          }}
        />
        {error ? (
          <div role="alert">
            <pre
              style={{
                margin: 0,
                padding: 16,
                fontFamily: 'Menlo, monospace',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                backgroundColor: 'gold',
              }}
            >
              Error: {error}
            </pre>
          </div>
        ) : null}
      </div>
      <div style={{ backgroundColor: 'white' }}>
        <ErrorBoundary
          fallback={<div style={{ padding: 16 }}>Something went wrong.</div>}
          onError={(error) => setError(error.message)}
          resetKeys={[state.context.code]}
        >
          <div>{element}</div>
        </ErrorBoundary>
        <pre>{JSON.stringify(cursorPosition, null, 2)}</pre>
      </div>
    </div>
  )
}

App.defaultProps = {
  initialCode: '',
}
