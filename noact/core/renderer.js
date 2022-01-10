import { FiberNode } from './fiber'
import { types } from '../utils'

/**
 * set attributes to a HTMLElement
 * @param {HTMLElement} node
 * @param {string} key
 * @param {Object | String | Number | Function} value
 */

function setAttribute(node, key, value) {
  // cannot set any values with any parameter missing
  if (!node || !key || !value) return
  if (key === 'className') key = 'class'
  // add event handler
  if (/^on\w+$/.test(key)) {
    node[key.toLowerCase()] = value
  }
  // add style
  else if (key === 'style') {
    if (types.isObject(value)) {
      Object.entries(value).forEach(
        ([property, propVal]) =>
          (node.style[property] = types.isNumber(propVal) ? propVal + 'px' : propVal)
      )
    } else {
      node[key] = value
    }
  }
  // add other attributes
  else {
    node[key] = value
  }
}

/**
 * turning a vdom tree into a real dom tree
 * @param {FiberNode} vnode virtual dom tree
 * @param {HTMLElement} container a dom element the tree is going to mount
 */
function renderVdom(vnode, container) {
  let domNode = null
  // if vnode is a null or undefined, return textnode
  if (types.isNull(vnode) || types.isBool(vnode)) {
    domNode = document.createTextNode('')
    // if vnode is a number or string, return textnode
  } else if (types.isNumber(vnode) || types.isString(vnode)) {
    domNode = document.createTextNode(String(vnode))
    // if vnode is array, render each domNode of the array
  } else if (types.isArray(vnode)) {
    vnode.forEach((child) => renderVdom(child, container))
  }
  // if tag of the vnode is a html element,set attributes and renderVdom its children recursively
  else {
    domNode = document.createElement(vnode.tag)
    vnode.attrs &&
      Object.entries(vnode.attrs).forEach(([key, value]) => setAttribute(domNode, key, value))
    vnode.children && vnode.children.forEach((child) => renderVdom(child, domNode))
  }
  domNode && container.appendChild(domNode)
}

export default {
  renderVdom,
}
