1. 遍历watch属性
2. 调用createWatcher方法,调用vm.$watch()

3. 数据变化
4. 存入flushSchedulerQueue 队列
5. 触发watcher.run() => 执行watcher.get()取值
6. 触发handler callback，传入新值和旧值

题目
1. handler能传数组和字符串吗
2. watcher是如何被响应式数据收集的？ watcher.get()
