import Noact from 'noact'
import { useState } from 'noact'

function App(props) {
  const [flag, setFlag] = useState(false)
  const arr = flag ? [3, 2, 1] : [1, 2, 3]
  const switchFlag = () => setFlag(!flag)

  return (
    <div>
      <button onClick={switchFlag}>switch</button>
      {arr.map((x) => (
        <Counter key={x}>
          <div>hello</div>
        </Counter>
      ))}
    </div>
  )
}
function Counter(props) {
  const [count, setCount] = useState(0)
  return (
    <div>
      <button onClick={() => setCount(1 + count)}>click</button>
      {props.children}
      {count}
    </div>
  )
}

Noact.render(<App />, document.getElementById('app'))
