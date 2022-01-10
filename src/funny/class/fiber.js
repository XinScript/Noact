import { type } from '../utils';
export default function Fiber(tag, attrs, ...children) {
  this.tag = tag;
  this.attrs = attrs || {};
  this.children = children.flat();
  this.factory = {};
  if (!type.isFunction(tag)) {
    this.return = null;
  }
}
