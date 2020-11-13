import React from 'react'
import { jsx as emotionJsx } from '@emotion/react'
import merge from 'lodash.merge'

export default function jsx(
  type: any,
  props?: any,
  ...children: React.ReactNode[]
) {
  return emotionJsx(
    type,
    merge(props, {
      css: {
        cursor: 'default',
        ':hover': {
          outline: '1px solid dodgerblue',
        },
      },
      // TODO: Don't apply `onClick` prop to `React.Fragment`
      // TODO: Don't stop event propagation when command key is pressed
      onClick: (event: React.MouseEvent) => {
        event.stopPropagation()
        console.log({ type, props, children })
      },
    }),
    ...children,
  )
}
