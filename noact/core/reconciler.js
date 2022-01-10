import Renderer from './renderer'
import { generateVdom, update } from './fiber'

const Reconciler = {
  container: null,
  vdom: null,

  render(root, container) {
    // clear container
    container.innerHTML = ''
    this.container = container
    // render vdom
    this.vdom = generateVdom(root)
    // render real dom from vdom
    Renderer.renderVdom(this.vdom, this.container)
  },

  update(vnode) {
    const parent = vnode.return
    let newNode = null
    // if the updated vnode is the root, set the new root
    if (!parent) {
      newNode = update(vnode)
      this.vdom = newNode
    } else {
      // otherwise,replace part of the tree
      const index = parent.children.indexOf(vnode)
      parent.children[index] = update(vnode)
    }
    this.container.innerHTML = ''
    Renderer.renderVdom(this.vdom, this.container)
  },
}

export default Reconciler
