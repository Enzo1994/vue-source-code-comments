
    createCompilerCreator => createCompiler => compileToFunctions: createCompileToFunctionFn => compileToFunctions
          ↑                                 => compile: function compile(){} => baseCompile(template,finalOptions)
      baseCompile => render string code


静态render函数是如何生成的？
