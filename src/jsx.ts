import React from 'react'
import { jsx as emotionJsx } from '@emotion/react'
import merge from 'lodash.merge'

export default function jsx(
  type: any,
  props?: any,
  ...children: React.ReactNode[]
) {
  // Don't pass extra props to fragments.
  if (typeof type === 'symbol') {
    return emotionJsx(type as any, props, ...children)
  }

  props = props || {}
  const loc = props.__loc
  delete props.__loc

  return emotionJsx(
    type,
    merge(props, {
      css: {
        cursor: 'default',
        ':hover': {
          outline: '1px solid dodgerblue',
        },
      },
      // TODO: Don't stop event propagation when command key is pressed
      onClick: (event: React.MouseEvent) => {
        event.stopPropagation()
        console.log({ type, loc, props, children })
      },
    }),
    ...children,
  )
}
