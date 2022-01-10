import Reconciler from './reconciler'
import { types } from '../utils'

class StateNode {
  constructor(val) {
    this.val = val
    this.prev = null
    this.next = null
    this.belongTo = null
  }
}
const head = new StateNode('h')
const tail = new StateNode('t')
head.next = tail
tail.prev = head

const STATE_LIST = {
  cursor: head.next,
  head,
  tail,
}

function useState(initialState) {
  let cursor = STATE_LIST.cursor
  if (cursor === STATE_LIST.tail) {
    const node = new StateNode(initialState)
    node.prev = STATE_LIST.tail.prev
    node.prev.next = node
    STATE_LIST.tail.prev = node
    node.next = STATE_LIST.tail
    cursor = node
  }
  const setVal = (newVal) => {
    cursor.val = newVal
    Reconciler.update(cursor.belongTo)
  }
  const result = [cursor.val, setVal]
  STATE_LIST.cursor = cursor.next
  return result
}

/**
 * cleans state nodes in STATE_LIST
 * @param {FiberNode} vnode
 */
function cleanStates(vnode) {
  // a primitive node does not have any states
  if (types.isPrimitive(vnode)) return
  if (vnode.states) {
    // only component vdom node may have states
    // cut the link between state nodes and STATE_LIST
    let { start, end } = vnode.states
    start.prev.next = end.next
    end.next.prev = start.prev
    end.next = null
    start.prev = null
    vnode.states = null
  }
  // clean the child nodes
  vnode.children && vnode.children.forEach((child) => cleanStates(child))
}

export { useState, cleanStates, STATE_LIST, StateNode }
