
    createCompilerCreator => createCompiler => compileToFunctions: createCompileToFunctionFn => compileToFunctions
          ↑                                 => compile: function compile(){} => baseCompile(template,finalOptions)
      baseCompile => render string code


静态render函数是如何生成的？

Template => ast => render string => render function =>

optimize进行的静态节点收集

静态节点判断标准：

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

node.type === 2 是 {{}} 表达式 
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