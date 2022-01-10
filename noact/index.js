export { useState } from './core/hooks'
import { createElement } from './core/fiber'
import Reconciler from './core/reconciler'

const Noact = {
  createElement,
  render: (root, container) => {
    Reconciler.render(root, container)
  },
}

export default Noact
