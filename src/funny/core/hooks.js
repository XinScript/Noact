import Reconciler from './reconciler';

function StateNode(val) {
  this.val = val;
  this.prev = null;
  this.next = null;
  this.belongTo = null;
}
const head = new StateNode('h');
const tail = new StateNode('t');
head.next = tail;
tail.prev = head;

const STATE_LIST = {
  cursor: head.next,
  head,
  tail,
};

function useState(initialState) {
  let cursor = STATE_LIST.cursor;
  if (cursor === STATE_LIST.tail) {
    const node = new StateNode(initialState);
    node.prev = STATE_LIST.tail.prev;
    node.prev.next = node;
    STATE_LIST.tail.prev = node;
    node.next = STATE_LIST.tail;
    cursor = node;
  }
  const setVal = (newVal) => {
    cursor.val = newVal;
    Reconciler.update(cursor.belongTo);
  };
  const result = [cursor.val, setVal];
  STATE_LIST.cursor = cursor.next;
  return result;
}

export { useState, STATE_LIST, StateNode };
