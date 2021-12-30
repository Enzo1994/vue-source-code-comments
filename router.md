## 区分几个关键前置信息
1. `this.history`
2. `$router`
3. `this.transitionTo`

## 概念：
1. location: 对 url 的结构化描述
    ```js
    declare type Location = {
        _normalized?: boolean;
        name?: string;
        path?: string;
        hash?: string;
        query?: Dictionary<string>;
        params?: Dictionary<string>;
        append?: boolean;
        replace?: boolean;
    }
    ```
2. route: 表示路由中的一条路线，
    1. matched 属性包括匹配到的整条线路所有 RouteRecord，为组件渲染做准备
    ```js
    declare type Route = {
        path: string;
        name: ?string;
        hash: string;
        query: Dictionary<string>;
        params: Dictionary<string>;
        fullPath: string;
        matched: Array<RouteRecord>; // 关键
        redirectedFrom?: string;
        meta?: any;
    }
    ```
3. RouteRecord: 树形结构，标准化当前路由路线信息（完整 path）
    ```js
    declare type RouteRecord = {
        path: string;
        regex: RouteRegExp;
        components: Dictionary<any>;
        instances: Dictionary<any>;
        name: ?string;
        parent: ?RouteRecord;
        redirect: ?RedirectOption;
        matchAs: ?string;
        beforeEnter: ?NavigationGuard;
        meta: any;
        props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
    }
    ```
## 匹配器的创建：
1. 创建路由映射表,  都是为了通过 path 和 name 能快速查到对应的 RouteRecord，包括：
    1. pathList
    2. nameMap
    3. pathMap: {path: RouteRecord}
        ![pathMap把传入的路由表拍平](/images/pathMap把传入的路由表拍平.jpg)
2. addRoutes: 执行createRouteMap，更新路由表
3. match: 
    1. normalizeLocation 方法的作用是根据 raw，current 使用 _createRoute 计算出新的 location
## 跳转流程：
VueRouter.prototype.push => this.history.push => this.transitionTo => this.confirmTransition

跳转路径(to)会匹配到路由表里某个元素

## 整体流程：
1. 输入 url 跳转：this.$options.router = new VueRouter() => mixin beforeCreate =>  VueRouter.prototype.init() => transitionTo(getHash())
2. 组件内跳转：
## 关于 mixin 到 beforeCreate 钩子：
只是跟组件才会触发 router 的init
## transitionTo:
1. 用 match 方法从拍平了的路由表(pathMap)里找到和当前目标路径(to 的值)匹配的路由
2. 使用拍平了的路由表里的 parent 信息，沿着 parent 信息一直往上遍历存入到 to 路径的路线信息(`<Route`类型) 中的 matched，形成一条路线，为了渲染做准备
2. confirmTransition:
    1. 把 to 路径的路线信息中的 matched 解析成 activated 数组
    2. 执行跳转前钩子
    3. 触发异步组件
    3. confirmTransition 回调:
        1. updateRoute:
            1. 更新 this.current (this.current = route)
            2. 执行 this.cb: `history.listen(route => (this.app._route = route))`，这句最关键，这里是把当前的路由路线信息包括matched 信息存到_route 里，以供 router-view 中的 render 函数使用
            3. 执行路由 after 钩子
        2. 执行 transitionTo 回调
        3. 使用 pushState 和 replaceState 对齐路由地址


路径变化是路由中最重要的功能，我们要记住以下内容：路由始终会维护当前的线路，路由切换的时候会把当前线路切换到目标线路，切换过程中会执行一系列的导航守卫钩子函数，会更改 url，同样也会渲染对应的组件，切换完毕后会把目标线路更新替换当前线路，这样就会作为下一次的路径切换的依据。
## router-view:

# 如何和 vue 连接？
1. 通过在 vue 里面传入 new VueRouter
2. beforeCreate mixin
## 钩子执行顺序：
1. extractLeaveGuards(deactivated)
2. this.router.beforeHooks
3. activated.map(m => m.beforeEnter)
4. resolveAsyncComponents(activated)
5. extractEnterGuards(activated, postEnterCbs, () => this.current === route)
6. this.router.afterHooks.forEach(hook => hook && hook(route, prev))

## 确认：
1. 如何从 match 拿到组件的
