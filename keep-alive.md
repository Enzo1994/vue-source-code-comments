## 流程
1. 数据修改 => 触发 keep-alive 父组件更新 => 触发_render() => 触发_update => 触发 patch => patchVnode(keep-alive 父组件的) => updateChildren => patchVnode(keep-alive 的) => prepatch => updateChildComponent => 重新解析 slot(也就是 keep-alive 里面包裹的组件,是否有切换) => 如果有切换,强制更新一下 keep-alive 组件forceUpdate(keep-alive) => 触发 keepAlive.render() 方法 => 命中缓存 => 返回缓存中的 vnode.componentInstance => render 函数执行完毕 => 触发 _update patch + 实体化 DOM => createComponent => 照常插入子组件 DOM: vnode.elm => 触发 patch => 删除旧组件, 区别在于之前的DOM 实例被缓存到 vnode.elm 中了, 即使被从文档中移除, 下次再插入这个 dom 实例,依然会保持之前的状态

## 重中之重:
**如果DOM 实例被保存了,即使从文档中 remove, 再次添加也会保持删除前的状态**

## updateChildComponent 做了什么 
更新组件的事件、props
## 写入缓存

## 从缓存中读取

## 几个函数:
1. pruneCacheEntry: 调用组件的$destroy 方法; 清除组件在 cache 中的值
