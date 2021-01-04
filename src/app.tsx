import React from 'react'
import EditorMachineProvider from './editor-machine-provider'
import Editor from './editor'

interface AppProps {
  initialCode: string
}

export default function App({ initialCode }: AppProps) {
  return (
    <EditorMachineProvider initialCode={initialCode}>
      <Editor />
    </EditorMachineProvider>
  )
}

App.defaultProps = {
  initialCode: '',
}
