import { Fiber } from '../class'
import Reconciler from './reconciler'

function render(vnode, container) {
  Reconciler.init(vnode, container)
}
function createElement(tag, attrs, ...children) {
  return new Fiber(tag, attrs, ...children)
}
export default {
  createElement,
  render,
}
