---
title: Vue重学计划（一）
published: 2024-10-06
description: 突然就决定重新学一下Vue3了，这一次准备往更底层的方面研究一下，第一期就简单聊聊Vue的宏观架构方面的二次认知吧
tags: [Vue,前端,源码]
category: Vue3
draft: false
---
~~经过了很久的深思熟虑~~，突然就决定重新学一下Vue3了，这一次准备往更底层的方面研究一下，第一期就简单聊聊Vue的宏观架构方面的二次认知吧！（~~其实只是太懒罢了~~）

# 来自MVVM的伟力

后端大多是MVC架构来写CURD，前端也有个架构，MVVM。最早接触MVVM是做.NET 8 的WPF项目的时候，那时候年少轻狂，妄想把MVC那一套套用在前端上，最后还是无奈求助网友，得知了MVVM这个用来绑定view（视图）和model（数据）的架构。

MVVM（Model-View-ViewModel）架构：

1. 『View』：视图层（UI 用户界面）
2. 『ViewModel』：业务逻辑层（一切 js 可视为业务逻辑）
3. 『Model』：数据层（存储数据及对数据的处理如增删改查）

除了MVC和MVVM，我在做游戏开发的时候还接触过ECS架构，这种架构与Unity的组织架构如出一辙，在实体上绑定组件，交互让系统来提供，对于交互性和实时性非常强的游戏开发来说，ECS是非常有效的一种架构。

# 响应式数据绑定

在vue2中，实现双向数据绑定基于Object.defineProperties()实现

而在vue3中，响应式的数据绑定采用了基于Proxy的拦截

Vue 2 使用 getter / setters 完全是出于支持旧版本浏览器的限制。而在 Vue 3 中则使用了 Proxy 来创建响应式对象，仅将 getter / setter 用于 ref。

这里面的实现涉及到包括但不限于状态机、信号处理等知识，可以参考[深入响应式系统 | Vue.js (vuejs.org)](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)深入了解，这里就只简单聊聊：

```javascript
vue2
基于Object.defineProperty()实现
 
vue3 基于Proxy
proxy与Object.defineProperty(obj, prop, desc)方式相比有以下优势：
 
//丢掉麻烦的备份数据
//省去for in 循环
//可以监听数组变化
//代码更简化
//可以监听动态新增的属性；
//可以监听删除的属性 ；
//可以监听数组的索引和 length 属性；
 
    let proxyObj = new Proxy(obj,{
        get : function (target,prop) {
            return prop in target ? target[prop] : 0
        },
        set : function (target,prop,value) {
            target[prop] = 888;
        }
    })
```

# 虚拟DOM的优化

**在Vue2中,每次更新diff,都是全量对比,Vue3则只对比带有标记的,这样大大减少了非动态内容的对比消耗**

[Vue Template Explorer](https://vue-next-template-explorer.netlify.app/ "Vue Template Explorer") 我们可以通过这个网站看到静态标记

patch flag 优化静态树

```html
 <span>Hello world!</span>
<span>Hello world!</span>
<span>Hello world!</span>
<span>Hello world!</span>
<span>{{msg}}</span>
<span>Hello world!</span>
<span>Hello world! </span>
```

Vue3 编译后的 Vdom 是这个样子的

```javascript
export function render(_ctx，_cache，props，props，setup，data，data，options){return (_openBlock(),_createBlock(_Fragment,null，[
_createvNode( "span", null,"Hello world ! "),
_createvNode( "span",null，"Hello world! "),
_createvNode( "span"，null，"Hello world! "),
_createvNode( "span", null，"Hello world! "),
_createVNode("span", null，_toDisplaystring(_ctx.msg)，1/* TEXT */)，
_createvNode( "span", null，"Hello world! "),
_createvNode( "span", null，"Hello world! ")]，64/*STABLE_FRAGMENT */))
```

新增了 patch flag 标记

```javascript
TEXT = 1 // 动态文本节点
CLASS=1<<1,1 // 2//动态class
STYLE=1<<2，// 4 //动态style
PROPS=1<<3,// 8 //动态属性，但不包含类名和样式
FULLPR0PS=1<<4,// 16 //具有动态key属性，当key改变时，需要进行完整的diff比较。
HYDRATE_ EVENTS = 1 << 5，// 32 //带有监听事件的节点
STABLE FRAGMENT = 1 << 6, // 64 //一个不会改变子节点顺序的fragment
KEYED_ FRAGMENT = 1 << 7, // 128 //带有key属性的fragment 或部分子字节有key
UNKEYED FRAGMENT = 1<< 8, // 256 //子节点没有key 的fragment
NEED PATCH = 1 << 9, // 512 //一个节点只会进行非props比较
DYNAMIC_SLOTS = 1 << 10 // 1024 // 动态slot
HOISTED = -1 // 静态节点
BALL = -2
```

我们发现创建动态 dom 元素的时候，Vdom 除了模拟出来了它的基本信息之外，还给它加了一个标记： 1 /*TEXT*/

这个标记就叫做 patch flag（补丁标记）

patch flag 的强大之处在于，当你的 diff 算法走到 _createBlock 函数的时候，会忽略所有的静态节点，只对有标记的动态节点进行对比，而且在多层的嵌套下依然有效。

尽管 JavaScript 做 Vdom 的对比已经非常的快，但是 patch flag 的出现还是让 Vue3 的 Vdom 的性能得到了很大的提升，尤其是在针对大组件的时候。

# 应用TreeShaking的打包

简单来讲，就是在保持代码运行结果不变的前提下，去除无用的代码

在Vue2中，无论我们使用什么功能，它们最终都会出现在生产代码中。主要原因是Vue实例在项目中是单例的，捆绑程序无法检测到该对象的哪些属性在代码中被使用到

而Vue3源码引入tree shaking特性，将全局 API 进行分块。如果你不使用其某些功能，它们将不会包含在你的基础包中

就是比如你要用watch 就是import {watch} from 'vue' 其他的computed 没用到就不会给你打包减少体积

**具体可以参考我的其他博客**

# 组合式API

之前看到有人喷后端Spring仔是配置文件高手，其实我想说，Vue2的写法也很像在写配置文件，可能鱿鱼须当年也认为这样子分块会使得代码很有条理吧。

![API-COMP](https://user-images.githubusercontent.com/499550/62783026-810e6180-ba89-11e9-8774-e7771c8095d6.png)

确实，条理是有了，代码量和代码逻辑变得更加复杂了，所以我个人是更喜欢Vue3的组合式api的写法的.

组合式API除了带来响应式API，更多的是提供了生命周期钩子和依赖注入，这有点类似于Unity的C#脚本，也许这种前端的工作本就应该朝着这样的方向进化和发展？
