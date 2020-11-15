import { useMachine } from '@xstate/react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/jsx/jsx'
import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { ErrorBoundary } from 'react-error-boundary'
import appMachine from './app-machine'
import './codemirror.css'

interface AppProps {
  initialCode: string
}

export default function App({ initialCode }: AppProps) {
  const [state, send] = useMachine(appMachine, {
    context: { code: initialCode },
    devTools: true,
  })

  const editorRef = React.useRef<CodeMirror.Editor>()

  React.useEffect(() => {
    if (editorRef.current && state.context.selectedElementLocation) {
      editorRef.current.markText(
        toCodeMirrorPosition(state.context.selectedElementLocation.start),
        toCodeMirrorPosition(state.context.selectedElementLocation.end),
        { className: 'selected-element' },
      )
    }
  }, [state.context.selectedElementLocation])

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
          editorDidMount={(editor) => (editorRef.current = editor)}
          value={state.context.code}
          onBeforeChange={(editor, data, value) =>
            send('CODE_CHANGE', { value })
          }
          onCursor={(editor) =>
            send('CURSOR', { position: editor.getCursor() })
          }
          options={{
            mode: 'jsx',
            lineNumbers: true,
          }}
        />
        {state.context.error ? (
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
              Error: {state.context.error}
            </pre>
          </div>
        ) : null}
      </div>
      <div style={{ backgroundColor: 'white' }}>
        <ErrorBoundary
          fallback={<div style={{ padding: 16 }}>Something went wrong.</div>}
          onError={(error) => send('ERROR', { message: error.message })}
          resetKeys={[state.context.element]}
        >
          <div>{state.context.element}</div>
        </ErrorBoundary>
        <pre>{JSON.stringify(state.context.cursorPosition, null, 2)}</pre>
      </div>
    </div>
  )
}

App.defaultProps = {
  initialCode: '',
}

function toCodeMirrorPosition(location: {
  line: number
  column: number
}): CodeMirror.Position {
  return {
    line: location.line - 1, // Convert to zero-indexed line number.
    ch: location.column,
  }
}
