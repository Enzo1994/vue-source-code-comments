## computed watcher 监听
1. 初始化 computed watcher 的时候，不管内部有没有响应式数据，都生成一个computedWatcher，此时不需要取值收集依赖
2. 执行render函数，遇到 computed 属性，执行我们传的 computed 的 getter,如果第一次取值，

3. 总流程：
    1. initComputed，生成computedWatcher，给vm上直接绑定这个computed属性并设置上setter和getter => 
    2. data内的数据发生修改，触发 render 函数生成虚拟DOM，期间遇到computed属性，取值`"+_s(testObj)+"\n` => 
    4. 会触发watcher.evaluate() => 
    5. 修改dirty为false（下次再遇到这个computed属性，直接返回值即可，不用重新求值）
    6. computed依赖的数据发生变化 => 
    7. 触发watcher.update() => 
    8. 修改dirty为true => 
    9. 再触发render函数，遇到取这个computed属性的`"+_s(testObj)+"\n`时候，重新watcher.evalueate()和 watcher.get()求值

核心：依赖数据修改：触发dirty变化，取值：触发dirty变化；如果dirty为true，就取值

## 题目
1. 题目1：computed的缓存机制：依赖的数据发生变化，render函数取值，取值存入computedWatcher的value属性，修改dirty标志，再取值直接取computedWatcher的上次取值结果即可
2. 题目2：computed watcher 依赖收集时机？第一次render函数触发
3. 题目3：如果computed里返回一个没有绑定响应式的属性，会不会此computedWatcher被收集，是否会触发重新计算？ 只要包含至少一个响应式属性，就会被收集
    ```js
    module.exports = {
        data: {
          obj: { a: 333 },
        },
        computed: {
            testObj() {
                return this.obj.b;
            },
        },
    };
    ```
    **数据变化=> 触发computedWatcher => 开启dirty => 下次在render函数取值时顺便关闭dirty （数据变化只会开启dirty）**
    1. render触发取值，虽然b是undefined，但是会触发 obj 的 getter，因为obj是绑定了响应式属性，b没有绑定
    2. 这个时候会把 computed watcher **收集成this.obj的依赖**（依赖是每层都收集的，对象取值也是一层一层取，get子属性值会触发父属性的getter）
    3. 所以如果修改了this.obj，也触发 computed watcher 的重新计算，只是值还是undefined罢了
    4. `this.obj = {b: 666}` 这样触发computed watcher重新计算，b就有值了
8. 题目4：如果computed里面的所有数据都没有绑定响应式，在render取值的时候，会不会调用computed handler？
    答：只会渲染一次，此次dirty被改成false，也就是缓存起来，因为此computedWatcher没有被属性收集，所以响应式数据发生变化，**不会触发evaluate修改dirty**，再取computed属性永远会取第一次缓存的值

代码都实现完成之后，我们说下流程，

1、首先在render函数里面会读取this.info，这个会触发createComputedGetter(key)中的computedGetter(key)；

2、然后会判断watcher.dirty，执行watcher.evaluate()；

3、进到watcher.evaluate()，才真想执行this.get方法，这时候会执行pushTarget(this)把当前的computed watcher push到stack里面去，并且把Dep.target 设置成当前的computed watcher`；

4、然后运行this.getter.call(vm, vm) 相当于运行computed的info: function() { return this.name + this.age }，这个方法；

5、info函数里面会读取到this.name，这时候就会触发数据响应式Object.defineProperty.get的方法，这里name会进行依赖收集，把watcer收集到对应的dep上面；并且返回name = '张三'的值，age收集同理；

6、依赖收集完毕之后执行popTarget()，把当前的computed watcher从栈清除，返回计算后的值('张三+10')，并且this.dirty = false；

7、watcher.evaluate()执行完毕之后，就会判断Dep.target 是不是true，如果有就代表还有渲染watcher，就执行watcher.depend()，然后让watcher里面的deps都收集渲染watcher，这就是双向保存的优势。

8、此时name都收集了computed watcher 和 渲染watcher。那么设置name的时候都会去更新执行watcher.update()

9、如果是computed watcher的话不会重新执行一遍只会把this.dirty 设置成 true，**如果数据变化的时候再执行watcher.evaluate()进行info更新，没有变化的的话this.dirty 就是false，不会执行info方法。这就是computed缓存机制。**

