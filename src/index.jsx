import React from 'react'
import ReactDOM from 'react-dom'
import { useState } from 'react'

function App(props) {
  const [count, setCount] = useState()
  const onclick = (e) => {
    setCount(count + 1)
  }
  return (
    <div>
      <div>
        <button onclick={onclick}>click me</button>
      </div>
      <div>{count}</div>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('app')
)
