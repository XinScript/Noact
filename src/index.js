/* eslint-env browser */
import './less/index.less'
import './less/font.less'
import Funny, { useState } from './funny'

function App(props) {
  const [flag, setFlag] = useState(false)
  const arr = flag ? [0, 2, 1] : [1, 2, 3]
  const switchFlag = () => setFlag(!flag)
  return (
    <div>
      <button onClick={switchFlag}>switchFlag</button>
      {[arr, arr]}
    </div>
  )
}

function Counter(props) {
  const [count, setCount] = useState(0)
  const onclick = (e) => {
    setCount(count + 1)
  }
  return (
    <div>
      <div>
        <button onClick={onclick}>click me</button>
      </div>
      <div>{count}</div>
    </div>
  )
}

Funny.render(<App />, document.getElementById('app'))
