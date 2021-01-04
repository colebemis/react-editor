import { types } from '@babel/core'
import merge from 'lodash.merge'
import React from 'react'
import { useEditorMachine } from './editor-machine-provider'

interface WrapperProps {
  children: React.ReactElement
  __location: types.SourceLocation
}

// TODO: Namespace this component to avoid clashing with userland components
export default function Wrapper({
  children,
  __location: location,
  ...props
}: WrapperProps) {
  const [state, send] = useEditorMachine()

  const isSelected =
    location.start.line ===
      state?.context.selectedElementLocation?.start.line &&
    location.start.column ===
      state?.context.selectedElementLocation?.start.column

  const newProps = merge(props, {
    style: {
      cursor: 'default',
      outline: isSelected ? '1px solid dodgerblue' : null,
    },
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation()
      send?.('SELECT_ELEMENT', { location })
    },
  })

  return React.cloneElement(children, newProps)
}
