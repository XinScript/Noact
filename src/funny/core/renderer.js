import { Fiber } from '../class'
import { DIFF } from '../constants'
import { type } from '../utils'
import { StateNode, STATE_LIST } from './hooks'

/**
 * set attributes to a HTMLElement
 * @param {HTMLElement} node
 * @param {string} key
 * @param {Object | String | Number} value
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
    if (type.isObject(value)) {
      Object.entries(value).forEach(
        ([property, propVal]) =>
          (node.style[property] = type.isNumber(propVal) ? propVal + 'px' : propVal)
      )
    } else {
      node[key] = value
    }
  }
  // add other attributes
  else {
    node[key] = type.isNull(value) ? '' : value
  }
}

function setReturn(node, component) {
  type.isObject(node) && (node.return = component)
}
/**
 * turning a vdom tree into a real dom tree
 * @param {Fiber} vnode virtual dom tree
 * @param {HTMLElement} container a dom element the tree is going to mount
 */
function renderVdom(vnode, container) {
  let node = null
  // if vnode is a null or undefined, return textnode
  if (type.isNull(vnode) || type.isBool(vnode)) {
    node = document.createTextNode('')
    // if vnode is a number or string, return textnode
  } else if (type.isNumber(vnode) || type.isString(vnode)) {
    node = document.createTextNode(String(vnode))
    // if vnode is array, render each node of the array
  } else if (type.isArray(vnode)) {
    vnode.forEach((child) => renderVdom(child, container))
  }
  // if tag of the vnode is a html element,set attributes and renderVdom its children recursively
  else {
    const ele = document.createElement(vnode.tag)
    vnode.attrs &&
      Object.entries(vnode.attrs).forEach(([key, value]) => setAttribute(ele, key, value))
    vnode.children && vnode.children.forEach((child) => renderVdom(child, ele))
    node = ele
  }
  node && container.appendChild(node)
}

/**
 * instantiation of a factory fiber
 * @param {Fiber} component Factory fiber that used as the factory of the instance
 * @param {StateNode} cursor the cursor used to load the state nodes
 */
function instantiate(component, cursor) {
  // save the current cursor of the STATE_LIST
  let start
  let originalCursor
  if (cursor) {
    originalCursor = STATE_LIST.cursor
    STATE_LIST.cursor = cursor
    // start reading states
    start = STATE_LIST.cursor.prev
  }
  const instance = component.tag(component.attrs, component.children)
  let fiber = null
  if (type.isArray(instance)) {
    // only array instance need to be mounted at a div element
    fiber = new Fiber('div', null, instance)
    instance.forEach((x) => setReturn(x, fiber))
  } else {
    fiber = instance
  }
  if (cursor) {
    const end = STATE_LIST.cursor.prev
    for (let current = start.next; current !== end.next; current = current.next) {
      current.belongTo = fiber
    }
    if (start.next !== STATE_LIST.tail) {
      fiber.states = {
        start: start.next,
        end,
      }
    }
  }
  // put back original cursor
  STATE_LIST.cursor = originalCursor
  fiber.factory = component
  return fiber
}

/**
 * turning a raw component to a fiber tree
 * @param {Fiber} component Fiber node, could be a factory vdom node or just a normal node
 */

function renderComponent(component) {
  // if the component is primitive, returns it
  if (
    type.isNull(component) ||
    type.isBool(component) ||
    type.isNumber(component) ||
    type.isString(component)
  ) {
    return component
  } else if (type.isArray(component)) {
    return component.map((child) => renderComponent(child))
  } else {
    // if the component is a factory fiber, instantiate it
    if (type.isFunction(component.tag)) {
      const instance = instantiate(component, STATE_LIST.cursor)
      return renderComponent(instance)
    } else {
      // otherwise, render the children directly
      component.children = renderComponent(component.children)
      // link each child of the component
      component.children.forEach((x) => setReturn(x, component))
      return component
    }
  }
}

/**
 * cleans state nodes in STATE_LIST
 * @param {Fiber} vnode
 */
function cleanStates(vnode) {
  // a primitive node does not have any states
  if (type.isPrimitive(vnode)) return
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

/**
 * Levenshtein distance calculation
 *
 * @param {Array} word1
 * @param {Array} word2
 */

function compareArray(word1, word2) {
  let m = word1.length,
    n = word2.length
  let dp = Array(m + 1)
    .fill(0)
    .map((_, i) =>
      Array(n + 1)
        .fill(0)
        .map((_, j) => {
          if (i === 0) {
            return Array(j).fill('-')
          } else {
            return Array(i).fill('+')
          }
        })
    )

  const getLen = (arr) => arr.filter((x) => x !== DIFF.SAME).length

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1].concat([DIFF.SAME])
      } else {
        const update = getLen(dp[i - 1][j - 1])
        const placement = getLen(dp[i][j - 1])
        const del = getLen(dp[i - 1][j])
        let op = Math.min(update, del, placement)
        if (op === update) {
          dp[i][j] = dp[i - 1][j - 1].concat([DIFF.UPDATE])
        } else if (op === del) {
          dp[i][j] = dp[i - 1][j].concat([DIFF.DELETE])
        } else {
          dp[i][j] = dp[i][j - 1].concat([DIFF.PLACEMENT])
        }
      }
    }
  }
  return dp[m][n]
}

/**
 * diff funciton compares a vdom tree and an uninstantiated vdom tree and returns a new tree
 * @param {Fiber} vnode1 vdom tree
 * @param {Fiber} vnode2 uninstantiated vdom tree
 */

function diff(vnode1, vnode2) {
  // if vnode1 if a primitive, render vnode2 and return it
  if (type.isPrimitive(vnode1)) return renderComponent(vnode2)
  if (type.isPrimitive(vnode2)) {
    cleanStates(vnode1)
    return vnode2
  } else if (type.isArray(vnode2)) {
    if (type.isArray(vnode1)) {
      const keys1 = vnode1.map(
        (x) =>
          x && ((x.factory && x.factory.attrs && x.factory.attrs.key) || (x.attrs && x.attrs.key))
      )
      const keys2 = vnode2.map((x) => x.attrs && x.attrs.key)
      const diffs = compareArray(keys1, keys2)
      const results = []
      for (let i = 0, j = 0, k = 0; i < diffs.length; i++) {
        if (diffs[i] === DIFF.SAME) {
          results.push(diff(vnode1[k], vnode2[j]))
          k++
          j++
        } else if (diffs[i] === DIFF.DELETE) {
          k++
        } else if (diffs[i] === DIFF.PLACEMENT) {
          results.push(renderComponent(vnode2[j]))
          j++
        } else {
          results.push(renderComponent(vnode2[j]))
        }
      }
      return results
    } else {
      // if vnode1 if not an array, clean state then render and render vnode2
      cleanStates(vnode1)
      return renderComponent(vnode2)
    }
  } else if (type.isFunction(vnode2.tag)) {
    if (vnode2.tag === vnode1.factory.tag) {
      // if factory is the same, keep diffing the children
      const fiber = instantiate(vnode2, vnode1.states ? vnode1.states.start : null)
      // const fiber = instantiate(vnode2, vnode1.states ? vnode1.states.start : null);
      fiber.return = vnode1.return
      fiber.children = diff(vnode1.children, fiber.children)
      fiber.children.forEach((x) => setReturn(x, fiber))
      return fiber
    } else {
      // clean state
      cleanStates(vnode1)
      // render and return a brand new component
      return renderComponent(vnode2)
    }
  } else {
    if (vnode1.tag === vnode2.tag) {
      // if tag is the same, keep diffing the children
      vnode2.children = diff(vnode1.children, vnode2.children)
      vnode2.children.forEach((x) => setReturn(x, vnode2))
      return vnode2
    } else {
      // if tag is not the same, render and return new component
      cleanStates(vnode1)
      return renderComponent(vnode2)
    }
  }
}

/**
 * gets a new vdom tree with the state updates
 * @param {Fiber} vnode1 a vdom node that triggers state update
 */

function update(vnode1) {
  return diff(vnode1, vnode1.factory)
}

export default {
  renderVdom,
  renderComponent,
  update,
}
