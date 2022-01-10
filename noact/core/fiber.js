import { types } from '../utils'
import { StateNode, STATE_LIST, cleanStates } from './hooks'

class FiberNode {
  constructor(tag, attrs, children) {
    this.return = null
    this.tag = tag
    this.attrs = attrs || {}
    this.children = children.flat() || []
    this.children.forEach((child) => setReturn(child, this))
    this.factory = {}
  }
}

class FiberFactoryNode {
  constructor(type, props, children) {
    this.type = type
    this.props = {
      ...props,
      children: children.flat() || [],
    }
  }
}

function setReturn(child, parent) {
  types.isObject(child) && (child.return = parent)
}

/**
 * instantiation of a factory fiber
 * @param {FiberNode} component Factory fiber that used as the factory of the instance
 * @param {StateNode} cursor the cursor used to load the state nodes
 */
function instantiate(fiberFactoryNode, cursor) {
  // save the current cursor of the STATE_LIST
  let start
  let originalCursor
  if (cursor) {
    originalCursor = STATE_LIST.cursor
    STATE_LIST.cursor = cursor
    // start reading states
    start = STATE_LIST.cursor.prev
  }
  const instance = fiberFactoryNode.type(fiberFactoryNode.props)
  let fiber = null
  if (types.isArray(instance)) {
    // only array instance need to be mounted at a div element
    fiber = new FiberNode('div', null, instance)
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
  fiber.factory = fiberFactoryNode
  return fiber
}

/**
 * turning a raw component to a fiber tree
 * @param {FiberNode} component FiberNode node, could be a factory vdom node or just a normal node
 */

function generateVdom(component) {
  // if the component is primitive, returns it
  if (types.isPrimitive(component)) {
    return component
  } else if (types.isArray(component)) {
    return component.map((child) => generateVdom(child))
  } else if (component instanceof FiberFactoryNode) {
    // if the component is a factory fiber, instantiate it
    return generateVdom(instantiate(component, STATE_LIST.cursor))
  } else {
    // otherwise, render the children directly
    component.children = generateVdom(component.children)
    // link each child of the component
    component.children.forEach((child) => setReturn(child, component))
    return component
  }
}

/**
 * diff funciton compares a vdom tree and an uninstantiated vdom tree and returns a new tree
 * @param {FiberNode} vnode1 vdom tree
 * @param {FiberNode} vnode2 uninstantiated vdom tree
 */

function getKey(node, candidateKey) {
  if (types.isPrimitive(node)) return candidateKey
  if (node instanceof FiberFactoryNode) {
    if (!types.isNull(node.props.key)) {
      return node.type.name + node.props.key
    } else {
      return node.type.name + candidateKey
    }
  } else if (node.factory instanceof FiberFactoryNode) {
    if (!types.isNull(node.factory.props.key)) {
      return node.factory.type.name + node.factory.props.key
    } else {
      return node.factory.type.name + candidateKey
    }
  } else {
    if (!types.isNull(node.attrs.key)) {
      return node.tag + node.attrs.key
    } else {
      return node.tag + candidateKey
    }
  }
}

function diff(vnode1, vnode2) {
  // if vnode1 if a primitive, render vnode2 and return it
  if (types.isPrimitive(vnode1)) return generateVdom(vnode2)
  if (types.isPrimitive(vnode2)) {
    cleanStates(vnode1)
    return vnode2
  } else if (types.isArray(vnode2)) {
    if (types.isArray(vnode1)) {
      const keys1 = vnode1.map((node, candidateKey) => getKey(node, candidateKey))
      const keymap = vnode1
        .map((node, i) => ({ [keys1[i]]: node }))
        .reduce((a, b) => ({ ...a, ...b }), {})
      return vnode2.map((node, candidateKey) => {
        let key = getKey(node, candidateKey)
        return diff(keymap[key], node)
      })
    } else {
      // if vnode1 if not an array, clean state then render and render vnode2
      cleanStates(vnode1)
      return generateVdom(vnode2)
    }
  } else if (vnode2 instanceof FiberFactoryNode) {
    if (vnode2.type === vnode1.factory.type) {
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
      return generateVdom(vnode2)
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
      return generateVdom(vnode2)
    }
  }
}

function update(vnode) {
  return diff(vnode, vnode.factory)
}

function createElement(tag, attrs, ...children) {
  return types.isFunction(tag)
    ? new FiberFactoryNode(tag, attrs, children)
    : new FiberNode(tag, attrs, children)
}

export { FiberNode, FiberFactoryNode, createElement, update, generateVdom }
