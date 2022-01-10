import Renderer from './renderer'
import { nextTick } from '../utils'
const Reconciler = {
  container: null,
  vdom: null,
  updating: false,

  init(root, container) {
    // clear container
    container.innerHTML = ''
    this.container = container
    // render vdom
    this.vdom = Renderer.renderComponent(root)
    console.log(this.vdom)
    // render real dom from vdom
    Renderer.renderVdom(this.vdom, this.container)
  },

  update(vnode) {
    const parent = vnode.return
    let newNode = null
    // if the updated vnode is the root, set the new root
    if (!parent) {
      newNode = Renderer.update(vnode)
      this.vdom = newNode
    } else {
      // otherwise,replace part of the tree
      const index = parent.children.indexOf(vnode)
      newNode = Renderer.update(vnode)
      parent.children[index] = newNode
    }
    if (!this.updating) {
      this.updating = true
      nextTick(() => {
        this.container.innerHTML = ''
        Renderer.renderVdom(this.vdom, this.container)
        // process multiple updates in one tick
        this.updating = false
      })
    }
  },
}

export default Reconciler
