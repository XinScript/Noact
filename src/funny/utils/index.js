import type from './type';
function nextTick(task) {
  Promise.resolve().then(() => {
    type.isFunction(task) && task();
  });
}

export { type, nextTick };
