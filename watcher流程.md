1. 遍历watch属性
2. 调用createWatcher方法,调用vm.$watch()

3. 数据变化
4. 存入flushSchedulerQueue 队列
5. 触发watcher.run() => 执行watcher.get()取值
6. 触发handler callback，传入新值和旧值

题目
1. handler能传数组和字符串吗
2. watcher是如何被响应式数据收集的？ watcher.get()
3. watcher 流程
  1. 
```js
function createWatch () {
  Vue.prototype.$watch = function (expOrFn, cb){
    var watcher = new Watcher() // 收集依赖
    if(watcher.immediate) {
      cb()
    }
    return function unwatchFn() {
      watcher.teardown()
    }
  }
  return vm.$watch()
}
```
user watcher 和 render watcher 在更新时会被加入队列（*和computed区别*）
```js
Watcher.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
        this.dirty = true;
    } else if (this.sync) {
        this.run();
    } else {
        queueWatcher(this);  // 这里
    }
};
```

queueWatcher如何工作：
1. 判断是否有这个watcher id 在watcher队列里
2. 如果有，直接跳过
2. 如果没在flushing，push当前watcher进队列
3. 如果在flushing，


watcher.run做了什么
1. 通过watcher.get()取值 
2. 调用 watcher 的 cb ，把新值传入
```js
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();  // 获取新值
    if (
      value !== this.value ||
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value; 
      this.value = value;  
      this.cb.call(this.vm, value, oldValue); // 调用回调
    }
  }
};
```

watcher同步更新会导致什么问题？每一次数据变化都会触发页面重新渲染

问题：怎么知道当前队列结束了，进而触发 flushSchedulerQueue

流程：
1. 数据变化 => update => queueWatcher => nextTick(flushSchedulerQueue) => update结束


nextTick维护一个callbacks 列表
每次调用nextTick，就把callback存入 callbacks
等到当前宏任务完成，就遍历执行callbacks里的所有回调
```js
    // 执行所有回调
  function flushCallbacks () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }
```
pending意义是如果队列上次flush刷新已经结束，也就是上次异步队列执行完成，才可以设置本次的callback队列刷新，而且只会设置一次到异步队列

![flush流程](/images/nextTick.jpg)

流程
```js
var callbacks = [] // nextTick callbacks
var pending = false // 异步任务的回调是否执行完成

var queue = [] // watcher queue
var flushing = false // queue 内的 watcher是否执行完成

var waiting = false; // 攒着，等异步flush队列都执行完了，再一股脑设置上新的异步队列

Watcher.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
        this.dirty = true;
    } else if (this.sync) {
        this.run();
    } else {
        queueWatcher(this);  // 这里
    }
};

function queueWatcher (watcher) {
  queue.push(watcher)
  if(!waiting) {
    waiting = true /
    nextTick(flushSchedulerQueue)
  }
}

function nextTick(cb){
  callbacks.push(cb)
  if(!pending) {
    pending = true // 只在上次微任务完成后添加一次
    timeFunc()
  }
}

function flushSchedulerQueue(){
  // 微任务实际上执行的是这个函数
  flushing = true;
  queue.forEach(watcher => watcher.run())
  // watcher queue 异步执行完毕
  flushing = false;
  waiting = false; // 
  callHook(vm, 'updated');
  callHook(vm, 'activated');
}


function timeFunc(){
  Promise.resolve().then(flushCallbacks)
}

function flushCallbacks() {
  callbacks.forEach(cb => {
    cb()
  })
  pending = false // 完成本轮微任务
}
```