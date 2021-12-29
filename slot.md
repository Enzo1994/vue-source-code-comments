## 核心：
1. 在执行子组件render函数之前，从组件的占位节点_parentVnode中拿到slots插头节点
## 代码：
1. 插头通过 genData$2 方法写入 render函数
2. 插槽通过 genSlot 写入 render函数
## 写入阶段流程:
1. processSlotContent 读取到的模板AST数据:
    ```js
    ({
        slotScope: "slotProps"
        slotTarget: "\"testSlot\""
        slotTargetDynamic: false
    })
    ```
2. 从ast的el.scopedSlots读出写入render函数的部分，scope slot会被解析为函数
    ```js
    [_c('Comp', {
        scopedSlots: _u([{
            key: "testSlot",
            fn: function(slotProps) {
                return [_c('div', [_v(_s(slotProps.count))])]
            }
        }])
    })]
    ```
----- **插头**通过 genData$2 写入render函数完成

1. processSlotOutlet 读取到插槽AST数据：
    ```js
    ({
        slotName: "\"testSlot\""
    })
    ```
2. 把插槽AST写入到vnode：
    ```js
    _t("testSlot",null,{"count":count})
    ```
----- **插槽**通过 genSlot 写入 render 函数完成

## 读取阶段流程：
1. 解析顺序一定是先解析插头（父节点中的组件使用位置），在解析插槽（子组件声明位置）
2. 在执行render函数之前，会先去`_parentVnode`里找到组建的**插头**信息，赋值给`$scopedSlots`
3. 执行子组件render函数，这个时候插头已经有了，fn写入到组件内了
4. 解析插槽，执行fn，传入_t方法的第三个参数作为props，即：
    ```js
    sclopedSlots.fn({count: 0})
    ```
5. 返回值是插头的vnode，替换了之前的插槽

## 注意：
1. _parentVnode 在这里：
    ```js
    function createComponentInstanceForVnode (
        vnode, // we know it's MountedComponentVNode but flow doesn't
        parent // activeInstance in lifecycle state
    ) {
        var options = {
        _isComponent: true,
        _parentVnode: vnode,  // _parentVnode 在这里
        parent: parent
        };
        return new vnode.componentOptions.Ctor(options) // 子组件实例化
    }
    ```
## 问题：
1. 为什么v-slot一定要在template里面
2. 插槽和插头是如何连接的
