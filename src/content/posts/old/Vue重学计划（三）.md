---
title: Vue重学计划（三）
published: 2024-10-10
description:  这周因为学校的事太多，耽误了好久，花了一天把Vue3的响应式数据整理了一下。
tags: [Vue,前端,源码]
category: Vue重学计划
draft: false
---
这周因为学校的事太多，耽误了好久，花了一天把Vue3的响应式数据整理了一下。

~~感觉太迷茫了，现在就是在岔路口做决策，摇摆不定了。。。~~

不知道咋办，还是先学习吧

简单用一个Demo过一下基本的使用吧！

main.ts

```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

App.vue

```html
<template>
  <RefDemo />
  <hr>
  <hr>
  <ReactiveDemo />
  <hr>
  <hr>
  <ToDemo />
</template>

<script setup lang="ts">
import ReactiveDemo from './components/reactiveDemo.vue';
import RefDemo from './components/refDemo.vue'
import ToDemo from './components/toDemo.vue';
</script>'
```

# Ref相关

refDemo.vue

```html
<style lang="css" scoped>
.alive {
  color: greenyellow;
}

.dead {
  color: red;
}
</style>

<template>
  <div>
    {{ Kevin }}
  </div>
  <div>
    {{ Elysia }}
  </div>
  <hr>
  <div>
    {{ Mobius }}
  </div>
  <hr>
  <button @click="Omega">Omega Befalling</button>
  <hr>
  <button @click="Alpha">Restarting new era</button>
  <hr>
  <button @click="toggle">Toggle Kevin</button>
</template>

<script setup lang="ts">
import { ref, customRef, shallowRef, Ref, triggerRef } from 'vue'

interface Hero {
  name: string
  power: string
  weapon: string
  rank: number
  state: string
}

const Kevin: Ref<Hero> = shallowRef({
  name: 'Kevin',
  power: 'Ice',
  weapon: 'God Fire',
  rank: 1,
  state: 'Alive'
})

const Elysia: Ref<Hero> = ref({
  name: 'Elysia',
  power: 'Crystal',
  weapon: 'Key of Humanity',
  rank: 2,
  state: 'Alive'
})

const Mobius: Ref<Hero> = ref({
  name: 'Mobius',
  power: 'Snake',
  weapon: 'Shadow of passed world',
  rank: 10,
  state: 'Alive'
})

function Omega(): void {
  Elysia.value.state = 'Dead'
  Mobius.value.state = 'Dead'
  console.log('我什么都做不到')
}

function Alpha(): void {
  Kevin.value.state = 'Missing'
  // 这里不要使用下面的句子，ref和shallowRef混用会导致浅层响应式失效
  // Mobius.value.state = 'Missing'
  console.log('人类，一定会战胜崩坏')
}

function toggle(): void {
  Kevin.value.state = Kevin.value.state === 'Alive' ? 'Missing' : 'Alive'
  triggerRef(Kevin)
  console.log('Kevin triggered')
}

// 下面演示一下自定义Ref（customRef）的用法
function MyRef<T>(value: T) {
  return customRef((tracker, trigger) => {
    return {
      get() {
        tracker()
        return value
      },
      set(newValue: T) {
        value = newValue
        trigger()
      }
    }
  })
}

const Kiana = MyRef({
  name: 'Kiana',
  power: 'x',
  weapon: 'y',
  state: 'Alive'
})
</script>
```

## PS

shallowRef和Ref不要混用，Ref在重新更新渲染的时候，会导致shallowRef的渲染也被更新，shallow属性就失效了

# Reactive相关

reactiveDemo.vue

```html
<style lang="css" scoped></style>

<template>
    <div>
        <ul>
            <li v-for="item in list.arr">{{ item }}</li>
        </ul>
        <button @click.prevent="add">add</button>
        <hr>
        <button @click="show">Show Numbers</button>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, readonly } from 'vue'

let list = reactive<{
    arr: string[]
}>({
    arr: []
})

let numList = reactive<{
    element: number[]
    otherElement: string[]
}>({
    element: [1, 2, 3],
    otherElement: ['a', 'b', 'c']
})
const readonlyNumList = readonly(numList)

const add = () => {
    setTimeout(() => {
        let res = ['grape', 'mango', 'strawberry']
        list.arr = res
        console.log(list)
    }, 2000)
}

const show = () => {
    console.log(numList.element, readonlyNumList.element)
}
</script>
```

## PS

readonly只能用在reactive数据上

调试可以发现，这个readonly的机制和响应式类似，都是使用proxy来进行

# toRef相关

toDemo.vue

```html
<template>
    <div>
        {{ furrymonster }}
    </div>
    <hr>
    <div>
        toRef:{{ fav }}
    </div>
    <hr>
    <div>
        <button @click="change">Change</button>
    </div>
</template>

<script setup lang="ts">
import { toRef, reactive, toRefs, toRaw } from 'vue';

const furrymonster = reactive({ name: 'FurryMonster', age: '20', fav: 'jerk off' })

const fav = toRef(furrymonster, 'fav')



const change = () => {
    furrymonster.fav = 'eat'
    console.log(furrymonster)
}
</script>

<style lang="css">
* {
    padding: 0;
    margin: 0;
}
</style>
```

## PS

toRef和toRaw都是基于reactive的，对于普通的对象，这两个函数不会发挥任何作用

从这里也不难发现，Vue3的ref基于reactive，reactive基于对普通数据（raw data）的proxy代理，它们之间是一个相互依赖的关系

# 响应式原理

Vue2 使用的是 Object.defineProperty  [Vue3](https://so.csdn.net/so/search?q=Vue3&spm=1001.2101.3001.7020) 使用的是 Proxy

#### reactive和effect的实现

```typescript
export const reactive = <T extends object>(target:T) => {
    return new Proxy(target,{
        get (target,key,receiver) {
          const res  = Reflect.get(target,key,receiver) as object
 
          return res
        },
        set (target,key,value,receiver) {
           const res = Reflect.set(target,key,value,receiver)
 
           return res
        }
    })
}
```

Vue3 的响应式原理依赖了 Proxy 这个核心 API，通过 Proxy 可以劫持对象的某些操作。

#### effect track trigger

实现effect 副作用函数

```typescript
let activeEffect;
export const effect = (fn:Function) => {
     const _effect = function () {
        activeEffect = _effect;
        fn()
     }
     _effect()
}
```

使用一个全局变量 active 收集当前副作用函数，并且初始化的时候调用一下

实现track

```typescript
const targetMap = new WeakMap()
export const track = (target,key) =>{
   let depsMap = targetMap.get(target)
   if(!depsMap){
       depsMap = new Map()
       targetMap.set(target,depsMap)
   }
   let deps = depsMap.get(key)
   if(!deps){
      deps = new Set()
      depsMap.set(key,deps)
   }
 
   deps.add(activeEffect)
}
```

执行完成成后我们得到一个如下的数据结构

![img](https://i-blog.csdnimg.cn/blog_migrate/37cb1779ae1ca34629f5614eccabc2e5.png)

实现trigger

```typescript
export const trigger = (target,key) => {
   const depsMap = targetMap.get(target)
   const deps = depsMap.get(key)
   deps.forEach(effect=>effect())
}
```

当我们进行赋值的时候会调用 set 然后 触发收集的副作用函数

```typescript
import {track,trigger} from './effect'
 
export const reactive = <T extends object>(target:T) => {
    return new Proxy(target,{
        get (target,key,receiver) {
          const res  = Reflect.get(target,key,receiver) as object
 
          track(target,key)
 
          return res
        },
        set (target,key,value,receiver) {
           const res = Reflect.set(target,key,value,receiver)
 
           trigger(target,key)
 
           return res
        }
    })
}
```

给 reactive 添加这两个方法

```html
<!DOCTYPE html>
<html lang="en">
 
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
 
<body>
 
    <div id="app">
 
    </div>
 
    <script type="module">
        import { reactive } from './reactive.js'
        import { effect } from './effect.js'
        const user = reactive({
            name: "小满",
            age: 18
        })
        effect(() => {
            document.querySelector('#app').innerText = `${user.name} - ${user.age}`
        })
 
        setTimeout(()=>{
            user.name = '大满很吊'
            setTimeout(()=>{
                user.age = '23'
            },1000)
        },2000)
 
    </script>
</body>
 
</html>
```

#### 递归实现reactive

```typescript
import { track, trigger } from './effect'
 
const isObject = (target) => target != null && typeof target == 'object'
 
export const reactive = <T extends object>(target: T) => {
    return new Proxy(target, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver) as object
 
            track(target, key)
 
            if (isObject(res)) {
                return reactive(res)
            }
 
            return res
        },
        set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver)
 
            trigger(target, key)
 
            return res
        }
    })
}
```
