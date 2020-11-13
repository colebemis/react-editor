// @ts-ignore
import babelPluginTransformJsx from '@babel/plugin-transform-react-jsx'
import { transform } from '@babel/standalone'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/theme/monokai.css'
import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { ErrorBoundary } from 'react-error-boundary'
import './codemirror.css'

const INITIAL_CODE = `<div style={{ padding: 16 }}>
  <h1 style={{ margin: 0 }}>Hello world</h1>
</div>
`

function App() {
  const [code, setCode] = React.useState(INITIAL_CODE)
  const [error, setError] = React.useState('')
  const [element, setElement] = React.useState<JSX.Element>()

  React.useEffect(() => {
    try {
      const transformedCode = transform(
        `<React.Fragment>${code}</React.Fragment>`,
        {
          plugins: [babelPluginTransformJsx],
        },
      ).code
      // Remove trailing semicolon to convert the transformed code into an expression
      const expression = transformedCode?.trim().replace(/;$/, '')
      // eslint-disable-next-line no-new-func
      const fn = new Function('React', `return (${expression})`)
      const element: JSX.Element = fn(React)

      setElement(element)
      setError('')
    } catch (error) {
      setError(error.message)
    }
  }, [code])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexGrow: 1 }}>
          <CodeMirror
            value={code}
            onBeforeChange={(editor, data, value) => setCode(value)}
            onCursor={(editor) => console.log(editor.getCursor())}
            options={{
              mode: 'jsx',
              theme: 'monokai',
              lineNumbers: true,
            }}
          />
        </div>
        {error ? (
          <pre
            style={{
              margin: 0,
              padding: 16,
              color: 'white',
              background: 'crimson',
              whiteSpace: 'pre-wrap',
            }}
          >
            {error}
          </pre>
        ) : null}
      </div>
      <ErrorBoundary
        fallback={<div style={{ padding: 16 }}>Something went wrong.</div>}
        onError={(error) => setError(error.message)}
        resetKeys={[code]}
      >
        <div>{element}</div>
      </ErrorBoundary>
    </div>
  )
}

export default App
