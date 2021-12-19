
    createCompilerCreator => createCompiler => compileToFunctions: createCompileToFunctionFn => compileToFunctions
          ↑                                 => compile: function compile(){} => baseCompile(template,finalOptions)
      baseCompile => render string code


静态render函数是如何生成的？

Template => ast => render string => render function =>

optimize进行的静态节点收集

静态节点判断标准：
1. 属性值写死
2. 文本节点不能有表达式
3. 不是built-in节点
4. 是浏览器保留节点
5. 属性没有 v-if 或者 v-for

```js
if (node.type === 2) { // expression ，也就是{{}}
    return false
}
if (node.type === 3) { // text
    return true
}
!!(node.pre || (  // 是否是 v-pre ，跳过编译直接展示节点
    !node.hasBindings && // no dynamic bindings （没有动态绑定attr，也就是非v-,:,@,#开头）
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in （不是slot、component节点）
    isPlatformReservedTag(node.tag) && // not a component （是html保留和svg节点）
    !isDirectChildOfTemplateFor(node) &&  // 排除父节点是 template + for 节点
    Object.keys(node).every(isStaticKey)  // 'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' 这些属性都有值
))
```

node.type === 2 是 包含{{}}的 表达式 
```js
if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
    child = {
        type: 2, // expression
        expression: res.expression,
        tokens: res.tokens,
        text: text
    };
}
```

## optimize方法：
1. 过滤掉子节点中的非静态节点，不递归过滤子节点的情况:除了 slot 标签之外的 built-in 节点：
2. 如果子节点不是静态节点，父节点也不是静态
3. statciInFor会被标记
4. 静态根节点的满足方法：
    - 节点本身必须是静态节点；
    - 必须拥有子节点 children；
    - 子节点不能只是只有一个文本节点；

下列属于静态根节点的是，子节点不能只是只有一个文本节点；
optimize先标记上静态节点，后面

## render函数：
compileToFunctions 方法拿到
```js
var res = {};
res.render = new Function(compiled.render)
res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
    return  new Function(code)
});
```

## 静态节点处理的_m方法：
1. render函数内：`'_m(0)'`
2. 静态vnode内：
    - key: `__static__0`
    - isStatic: `true`

1. this._staticTrees 内缓存所有通过`this.$options.staticRenderFns[index].call`调用返回的静态vnode

1. 在写staticRenderFns的时候，
2. 静态节点在render函数被执行的时候，把所有静态节点存入缓存数组
3. 之后用__static__加索引值替换当前静态节点

# 静态节点写入render函数：
1. 首先，每个组件维护一个静态vnode数组
1. 静态vnode的生成函数（静态render函数）push进staticRenderFns， 
2. 写入整体render函数的内容是`'_m(0)'`
```js
  // hoist static sub-trees out
  function genStatic (el, state) {
    debugger
    el.staticProcessed = true;
    // Some elements (templates) need to behave differently inside of a v-pre
    // node.  All pre nodes are static roots, so we can use this as a location to
    // wrap a state change and reset it upon exiting the pre node.
    var originalPreState = state.pre;
    if (el.pre) {
      state.pre = el.pre;
    }
    state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}")); // 1
    state.pre = originalPreState;
    return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")") //2
  }
```

# 静态节点调用render函数：
1. 调用render方法的时候，遇到`_m(0)`，
2. 拿着索引值取staticRenderFns里找，调用当前静态render函数，得到当前索引对应静态vnode，存入`this._staticTrees`，
3. 给静态vnode标记上索引值 key:`'__static__0'`,isSatatic: `true`

```js
 // 静态节点缓存树
  function renderStatic (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    if (tree && !isInFor) {
      return tree
    }
    // otherwise, render a fresh tree.
    tree = cached[index] = this.$options.staticRenderFns[index].call( // 2
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

```