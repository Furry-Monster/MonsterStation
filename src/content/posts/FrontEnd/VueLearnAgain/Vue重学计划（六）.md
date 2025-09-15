---
title: Vue重学计划（六） 
published: 2024-10-16
image: ./vue.png
description:  上一节聊完了SCSS和BEM架构，这一节来说说Vue中的组件部分，组件内容比较多，可能会用好几期博客来慢慢复习了。
tags: [Vue,前端,源码]
category: Vue重学计划
draft: false
---
上一节聊完了SCSS和BEM架构，这一节来说说Vue中的组件部分，组件内容比较多，可能会用好几期博客来慢慢复习了。

这一期简单讲讲组件基础知识吧。

# 生命周期

前端工程尽管是面向对象的，但是由于视觉上的呈现，需要经过一个渲染的加载过程，许多前端的框架和引擎都会天然提供生命周期的钩子，方便在不同的加载阶段执行不同的操作

例如，在Unity开发中，我们的代码是这样的：

```csharp
using System;
using UnityEngine;

public void GameBoot : Monobehaviour
{
 // 组件初始化
 void Awake(){}

 // 组件初始化完成
 void Start(){}

 // 组件启用
 void OnEnable(){}

 // 组件禁用
 void OnDisable(){}

 // 组件每一帧更新
 void Update(){}

 // 组件销毁
 void OnDestroy(){}
}
```

类似地，Vue框架也提供了生命周期钩子：

```html
<template>
    <h1>
        This is a component demo
    </h1>
    <div ref="div">{{ str }}</div>
    <button @click="change">修改</button>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onActivated, onDeactivated, onRenderTracked, onRenderTriggered, onErrorCaptured, onServerPrefetch } from 'vue'
// beforeCreate，created 在setup语法糖模式中没有这两个生命周期
console.log('setup')
const str = ref('hello')
const div = ref<HTMLDivElement>()

const change = () => {
    str.value = 'world'
}

//创建
onBeforeMount(() => {
    console.log('beforeMount', div.value)
})

onMounted(() => {
    console.log('mounted', div.value)
})
//更新
// 为什么这里面加了?.innerText前后，控制台输出的值不一样？？？
onBeforeUpdate(() => {
    console.log('beforeUpdate', div.value?.innerText)
})
onUpdated(() => {
    console.log('updated', div.value?.innerText)
})
//销毁
onBeforeUnmount(() => {
    console.log('beforeUnmount')
})

onUnmounted(() => {
    console.log('unmounted')
})
//调试
onRenderTracked((e) => {
    console.log('renderTracked')
    console.log(e)
})
onRenderTriggered((e) => {
    console.log('renderTriggered')
    console.log(e)
})
</script>

<style lang="css" scoped></style>
```

值得一提的是：

在我们使用[Vue3](https://so.csdn.net/so/search?q=Vue3&spm=1001.2101.3001.7020) 组合式API 是没有 `beforeCreate 和 created`这两个生命周期的

# 组件传参

组件传参大概有两个方向

### 父组件向子组件传参

子组件通过defineProperties来定义自己的属性参数，父组件通过v-bind指令来给每个属性传入一个参数，例如：

子组件.ts

```typescript
<template>
    <div class="menu">
        菜单区域 {{ title }}
        <div>{{ data }}</div>
    </div>
</template>
 
<script setup lang="ts">
defineProps<{
    title:string,
    data:number[]
}>()
</script>
```

父组件.ts

```typescript
<template>
    <div class="layout">
        <Menu v-bind:data="data"  title="我是标题"></Menu>
        <div class="layout-right">
            <Header></Header>
            <Content></Content>
        </div>
    </div>
</template>
 
<script setup lang="ts">
import Menu from './Menu/index.vue'
import Header from './Header/index.vue'
import Content from './Content/index.vue'
import { reactive } from 'vue';
 
const data = reactive<number[]>([1, 2, 3])
</script>
```

传递字符串类型，不需要v-bind，传递非字符串类型需要加v-bind，当然也可以用简写形式.

如果想设置默认值，可以使用withDefault函数

```typescript
type Props = {
    title?: string,
    data?: number[]
}
withDefaults(defineProps<Props>(), {
    title: "张三",
    data: () => [1, 2, 3]
})
```

### 子组件向父组件传参

这种传参有两个形式，一种是父组件通过方法来从子组件获取参数，另一种是子组件主动向父组件暴露参数，这两种方法各有各的应用场景，咱们分别来看看例子：

1. 子组件通过emit暴露事件

```typescript
<template>
    <div class="menu">
        <button @click="clickTap">派发给父组件</button>
    </div>
</template>
 
<script setup lang="ts">
import { reactive } from 'vue'
const list = reactive<number[]>([4, 5, 6])
 
const emit = defineEmits(['on-click'])
 
//如果用了ts可以这样两种方式
// const emit = defineEmits<{
//     (e: "on-click", name: string): void
// }>()
const clickTap = () => {
    emit('on-click', list)
}
 
</script>
```

我们在子组件绑定了一个click 事件 然后通过defineEmits 注册了一个自定义事件

点击click 触发 emit 去调用我们注册的事件 然后传递参数，父组件接受子组件的事件。

```typescript
<template>
    <div class="layout">
        <Menu @on-click="getList"></Menu>
        <div class="layout-right">
            <Header></Header>
            <Content></Content>
        </div>
    </div>
</template>
 
<script setup lang="ts">
import Menu from './Menu/index.vue'
import Header from './Header/index.vue'
import Content from './Content/index.vue'
import { reactive } from 'vue';
 
const data = reactive<number[]>([1, 2, 3])
 
const getList = (list: number[]) => {
    console.log(list,'父组件接受子组件');
}
</script>
```

我们从Menu 组件接受子组件派发的事件on-click 后面是我们自己定义的函数名称getList,会把参数返回过来

2. 子组件暴露给父组件内部属性

子组件暴露属性通过defineExpose

我们从父组件获取子组件实例通过ref：

```html
 <Menu ref="refMenu"></Menu>
//这样获取是有代码提示的
<script setup lang="ts">
import MenuCom from '../xxxxxxx.vue'
//注意这儿的typeof里面放的是组件名字(MenuCom)不是ref的名字 ref的名字对应开头的变量名(refMenu)
const refMenu = ref<InstanceType<typeof MenuCom>>()
</script>
```

这时候父组件想要读到子组件的属性可以通过 defineExpose暴露，子组件中这样写：

```typescript
const list = reactive<number[]>([4, 5, 6])
 
defineExpose({
    list
})
```
