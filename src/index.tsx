import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import './index.css'
import { inspect } from '@xstate/inspect'

if (process.env.NODE_ENV === 'development') {
  inspect({ iframe: false })
}

const INITIAL_CODE = `<div style={{ padding: 16 }}>
  <h1 style={{ margin: 0 }}>Hello world</h1>
  <p>Start editing to see some magic happen</p>
  {[1, 2, 3].map(n => <div key={n}>{n}</div>)}
</div>
`

ReactDOM.render(
  <React.StrictMode>
    <App initialCode={INITIAL_CODE} />
  </React.StrictMode>,
  document.getElementById('root'),
)
