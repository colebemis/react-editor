import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/jsx/jsx'
import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import './codemirror.css'
import { useEditorMachine } from './editor-machine-provider'
import Preview from './preview'

export default function Editor() {
  const [state, send] = useEditorMachine()

  const editorRef = React.useRef<CodeMirror.Editor>()
  const selectedElementMarkerRef = React.useRef<CodeMirror.TextMarker>()

  React.useEffect(() => {
    selectedElementMarkerRef.current?.clear()

    if (state?.context.selectedElementLocation) {
      selectedElementMarkerRef.current = editorRef.current?.markText(
        toCodeMirrorPosition(state.context.selectedElementLocation.start),
        toCodeMirrorPosition(state.context.selectedElementLocation.end),
        { className: 'selected-element' },
      )
    }
  }, [state?.context.selectedElementLocation])

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
          value={state?.context.code || ''}
          onBeforeChange={(editor, data, value) =>
            send?.('CODE_CHANGE', { value })
          }
          onCursor={(editor) =>
            send?.('CURSOR', { position: editor.getCursor() })
          }
          options={{
            mode: 'jsx',
            lineNumbers: true,
          }}
        />
        {state?.context.error ? (
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
              Error: {state?.context.error}
            </pre>
          </div>
        ) : null}
      </div>
      <div style={{ backgroundColor: 'white' }}>
        <Preview />
      </div>
    </div>
  )
}

Editor.defaultProps = {
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
