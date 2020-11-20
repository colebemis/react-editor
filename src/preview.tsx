import React from 'react'
import { useEditorMachine } from './editor-machine-provider'
import Wrapper from './wrapper'

export default function Preview() {
  const [state, send] = useEditorMachine()
  const scope = { React, Wrapper }

  if (!state?.context.transformedCode) {
    return null
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      ...Object.keys(scope),
      `return (${state?.context.transformedCode})`,
    )

    return fn(...Object.values(scope))
  } catch (error) {
    send?.('ERROR', { message: error.message })
    return <div style={{ padding: 16 }}>Something went wrong.</div>
  }
}
