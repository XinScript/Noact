import types from './types'
function nextTick(task) {
  Promise.resolve().then(() => {
    types.isFunction(task) && task()
  })
}

export { types, nextTick }
