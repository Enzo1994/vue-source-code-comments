## 区分几个关键前置信息
1. `this.history`
2. `$router`
3. `this.transitionTo`

## 跳转流程：
VueRouter.prototype.push => this.history.push => this.transitionTo => this.confirmTransition

## confirmTransition:
比对新旧路由对象是否相同 

## router.resolve:


## 确认：
1. 如何从 match 拿到组件的