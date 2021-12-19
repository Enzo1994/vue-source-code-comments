**patchVnode是保证新旧节点为同一节点再patch**

patch主要是应用上层虚拟dom渲染成底层真实DOM
1. 根据#app生成空的根vnode
2. 拿到#app 的父节点
3. 第一次的时候 oldVnode是#app，真实节点，这个时候直接递归子节点添加到dom上
4. 第二次的时候，oldVnode不是真实节点并且新老根节点是sameVnode，开始patchVnode
5. patchVnode：
    1. 如果新老children都定义了
    2. 如果只定义新children，老节点没有children
    3. 如果只定义老children，新节点没有children
    4. 如果老节点只有文字子节点，没有子节点，新节点既没有子节点也没有文字节点

createElm => createChildren => createElm(children)


## patchVnode做了什么
1. 更新DOM：
    0. updateAttrs(oldVnode, vnode)
    1. updateClass(oldVnode, vnode)
    2. updateDOMListeners(oldVnode, vnode)
    3. updateDOMProps(oldVnode, vnode)
    4. updateStyle(oldVnode, vnode)
    5. update(oldVnode, vnode)
    6. updateDirectives(oldVnode, vnode)
2. 节点判断：
    1. 新节点文本，总之就是文本节点和元素节点直接无脑替换：
        1. 是undefined：说明新节点是元素节点
            1. 新旧节点都有子节点
            2. 新节点有子节点，旧节点没有
            3. 
        2. 是`""`、`"非空字符串"`：新节点是文本节点
    2. 

## updateChildren：
1. 如果insertBefore了null前面等于在末尾插入
2. oldVnode 即为现在真实DOM
3. 根据新老vnode的对比结果，修改真实dom节点
4. 四种条件：
    1. oldStart vs. newStart
    2. oldEnd vs. newEnd
    3. oldStart vs. newEnd
    4. oldEnd vs. newStart
5. 四种都不匹配的情况：
    1. 找到newStart 在oldCh中的索引位置
    2. 如果找到，一律移动到 oldStart 前面（上层oldCh变undefined不移动，只移动底层DOM）
    3. 让 newStart 前进一位
    3. 下次一轮判断oldStart和newStart一样，直接跳过
6. 跳出后发现新旧数目对不上？
    1. 剩下的一定是start和end之间的节点是新增或删除

问题：
1. 如何判断是不是组件？有无vnode.data (createComponent内判断的)
2. 如何判断是sameVnode？
3. css的scoped如何实现？通过给节点加入scopeId作为dom属性：
```html
<style>
.example[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" data-v-f3f3eg9>hi</div>
</template>
```
3. 什么时候赋值给node.isStatic的