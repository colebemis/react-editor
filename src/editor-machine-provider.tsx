import { useMachine } from '@xstate/react'
import React from 'react'
import { Interpreter, State } from 'xstate'
import editorMachine, { EditorContext, EditorEvent } from './editor-machine'

const EditorMachineContext = React.createContext<
  // TODO: Compute useMachine return type instead of hard-coding the type
  | [
      State<EditorContext, EditorEvent>,
      Interpreter<EditorContext, any, EditorEvent>['send'],
      Interpreter<EditorContext, any, EditorEvent>,
    ]
  | []
>([])

interface EditorMachineProviderProps {
  initialCode: string
  children: React.ReactNode
}

export default function EditorMachineProvider({
  initialCode,
  children,
}: EditorMachineProviderProps) {
  const value = useMachine(editorMachine, {
    context: { code: initialCode },
    devTools: true,
  })

  return (
    <EditorMachineContext.Provider value={value}>
      {children}
    </EditorMachineContext.Provider>
  )
}

EditorMachineProvider.defaultProps = {
  initialCode: '',
}

export function useEditorMachine() {
  return React.useContext(EditorMachineContext)
}
