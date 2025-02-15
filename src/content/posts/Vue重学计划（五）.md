---
title: Vue重学计划（五）
published: 2024-10-11
description: 今日状态不错，特此奖励自己下午写博客一篇
tags: [Vue,前端,源码]
category: Vue3
draft: false
---

昨天聊完了computed，今天来聊聊watch和watchEffect

# 使用Watch

```html
<template>
    <div>
        case1:<input type="text" v-model="message">
        <hr>
        case2:<input type="text" v-model="message2">
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

let message = ref<string>('Hello Vue 3')

let message2 = ref<string>('Hello TypeScript')

watch([message, message2], (newVal, oldVal) => {
    console.log('newVal:', newVal, 'oldVal:', oldVal)
})
</script>

<style lang="css" scoped></style>
```

> watch需要侦听特定的数据源，并在单独的回调函数中执行副作用。默认情况下，它也是惰性的——即回调仅在侦听源发生变化时被调用。

watch的用法比较简单，说白了就是我们常说的监听器，有的地方叫Listener，有的地方叫Subscriber，其实无所谓。

不过watch的源码还是值得一看的，而且Vue3最近的更新中，watch和watchEffect也是重构过了

# 使用WatchEffect

```html
<template>
    <input type="text" v-model="message">
    <input type="text" v-model="message2">
    <p>{{ message }} {{ message2 }}</p>
    <button @click="stop">Stop Watching</button>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

let message = ref<string>("Genshin Impact")

let message2 = ref<string>("Genshin")

const stop = watchEffect((oninvalidate) => {

    console.log('message changed to:', message.value)
    oninvalidate(() => {
        console.log('before message changed')
    })
})

const 
</script>

<style lang="css" scoped></style>
```

立即执行传入的一个函数，同时响应式追踪其依赖，并在其依赖变更时重新运行该函数。

# 区别

> * **执行时机** ：watchEffect是立即执行的，在页面加载时会主动执行一次，来收集依赖；而watch是惰性地执行副作用，它不会立即执行，但可以配置 immediate，使其主动触发
>
> ```javascript
>  watchEffect(() => {
>        console.log(test.value)
>  })
>  watch (test.value,(val,oldval) => {
>        console.log(val)
>  },{ immediate: true })
>  //效果差不多
>
> ```
>
> * **参数不同** ：watchEffect只需要传递一个回调函数，不需要传递侦听的数据，它会在页面加载时主动执行一次，来收集依赖；而watch至少要有两个参数（第三个参数是配置项），第一个参数是侦听的数据，第二个参数是回调函数
> * **结果不同** ：watchEffect获取不到更改前的值；而watch可以同时获取更改前和更改后的值

简单一句话，`watch` 功能更加强大，而 `watchEffect` 在某些场景下更加简洁。

# 源码解析

Vue3的源码也是最近经过重构过的，在 `@vue/reactive/watch.ts`和 `@vue/runtime-core/apiWatch.ts`中可以看到。

我们在 `apiWatch.ts`中可以看到这三个开放的api接口以及实现中，都调用了doWatch:

api部分

```typescript
// Simple effect.
export function watchEffect(
  effect: WatchEffect,
  options?: WatchEffectOptions,
): WatchHandle {
  return doWatch(effect, null, options)
}

export function watchPostEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
): WatchHandle {
  return doWatch(
    effect,
    null,
    __DEV__ ? extend({}, options as any, { flush: 'post' }) : { flush: 'post' },
  )
}

export function watchSyncEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
): WatchHandle {
  return doWatch(
    effect,
    null,
    __DEV__ ? extend({}, options as any, { flush: 'sync' }) : { flush: 'sync' },
  )
}
```

实现部分

```typescript
// implementation
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
  source: T | WatchSource<T>,
  cb: any,
  options?: WatchOptions<Immediate>,
): WatchHandle {
  if (__DEV__ && !isFunction(cb)) {
    warn(
      `\`watch(fn, options?)\` signature has been moved to a separate API. ` +
        `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
        `supports \`watch(source, cb, options?) signature.`,
    )
  }
  return doWatch(source as any, cb, options)
}
```

顺着找到 `watch.ts`中的watch函数，可以看到：

```typescript
export function watch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb?: WatchCallback | null,
  options: WatchOptions = EMPTY_OBJ,
): WatchHandle {
  const { immediate, deep, once, scheduler, augmentJob, call } = options

  const warnInvalidSource = (s: unknown) => {
    ;(options.onWarn || warn)(
      `Invalid watch source: `,
      s,
      `A watch source can only be a getter/effect function, a ref, ` +
        `a reactive object, or an array of these types.`,
    )
  }

  const reactiveGetter = (source: object) => {
    // traverse will happen in wrapped getter below
    if (deep) return source
    // for `deep: false | 0` or shallow reactive, only traverse root-level properties
    if (isShallow(source) || deep === false || deep === 0)
      return traverse(source, 1)
    // for `deep: undefined` on a reactive object, deeply traverse all properties
    return traverse(source)
  }

  let effect: ReactiveEffect
  let getter: () => any
  let cleanup: (() => void) | undefined
  let boundCleanup: typeof onWatcherCleanup
  let forceTrigger = false
  let isMultiSource = false

  if (isRef(source)) {
    getter = () => source.value
    forceTrigger = isShallow(source)
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source)
    forceTrigger = true
  } else if (isArray(source)) {
    isMultiSource = true
    forceTrigger = source.some(s => isReactive(s) || isShallow(s))
    getter = () =>
      source.map(s => {
        if (isRef(s)) {
          return s.value
        } else if (isReactive(s)) {
          return reactiveGetter(s)
        } else if (isFunction(s)) {
          return call ? call(s, WatchErrorCodes.WATCH_GETTER) : s()
        } else {
          __DEV__ && warnInvalidSource(s)
        }
      })
  } else if (isFunction(source)) {
    if (cb) {
      // getter with cb
      getter = call
        ? () => call(source, WatchErrorCodes.WATCH_GETTER)
        : (source as () => any)
    } else {
      // no cb -> simple effect
      getter = () => {
        if (cleanup) {
          pauseTracking()
          try {
            cleanup()
          } finally {
            resetTracking()
          }
        }
        const currentEffect = activeWatcher
        activeWatcher = effect
        try {
          return call
            ? call(source, WatchErrorCodes.WATCH_CALLBACK, [boundCleanup])
            : source(boundCleanup)
        } finally {
          activeWatcher = currentEffect
        }
      }
    }
  } else {
    getter = NOOP
    __DEV__ && warnInvalidSource(source)
  }

  if (cb && deep) {
    const baseGetter = getter
    const depth = deep === true ? Infinity : deep
    getter = () => traverse(baseGetter(), depth)
  }

  const scope = getCurrentScope()
  const watchHandle: WatchHandle = () => {
    effect.stop()
    if (scope) {
      remove(scope.effects, effect)
    }
  }

  if (once && cb) {
    const _cb = cb
    cb = (...args) => {
      _cb(...args)
      watchHandle()
    }
  }

  let oldValue: any = isMultiSource
    ? new Array((source as []).length).fill(INITIAL_WATCHER_VALUE)
    : INITIAL_WATCHER_VALUE

  const job = (immediateFirstRun?: boolean) => {
    if (
      !(effect.flags & EffectFlags.ACTIVE) ||
      (!effect.dirty && !immediateFirstRun)
    ) {
      return
    }
    if (cb) {
      // watch(source, cb)
      const newValue = effect.run()
      if (
        deep ||
        forceTrigger ||
        (isMultiSource
          ? (newValue as any[]).some((v, i) => hasChanged(v, oldValue[i]))
          : hasChanged(newValue, oldValue))
      ) {
        // cleanup before running cb again
        if (cleanup) {
          cleanup()
        }
        const currentWatcher = activeWatcher
        activeWatcher = effect
        try {
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE
              ? undefined
              : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE
                ? []
                : oldValue,
            boundCleanup,
          ]
          call
            ? call(cb!, WatchErrorCodes.WATCH_CALLBACK, args)
            : // @ts-expect-error
              cb!(...args)
          oldValue = newValue
        } finally {
          activeWatcher = currentWatcher
        }
      }
    } else {
      // watchEffect
      effect.run()
    }
  }

  if (augmentJob) {
    augmentJob(job)
  }

  effect = new ReactiveEffect(getter)

  effect.scheduler = scheduler
    ? () => scheduler(job, false)
    : (job as EffectScheduler)

  boundCleanup = fn => onWatcherCleanup(fn, false, effect)

  cleanup = effect.onStop = () => {
    const cleanups = cleanupMap.get(effect)
    if (cleanups) {
      if (call) {
        call(cleanups, WatchErrorCodes.WATCH_CLEANUP)
      } else {
        for (const cleanup of cleanups) cleanup()
      }
      cleanupMap.delete(effect)
    }
  }

  if (__DEV__) {
    effect.onTrack = options.onTrack
    effect.onTrigger = options.onTrigger
  }

  // initial run
  if (cb) {
    if (immediate) {
      job(true)
    } else {
      oldValue = effect.run()
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true)
  } else {
    effect.run()
  }

  watchHandle.pause = effect.pause.bind(effect)
  watchHandle.resume = effect.resume.bind(effect)
  watchHandle.stop = watchHandle

  return watchHandle
}
```

所有的实现和api都可以接收函数，ref，数组，基本的实现逻辑就是挂载一个副作用上去进行调用，同时immediate属性会取消懒加载，在初次进入的时候就可以调用。

所以watchEffect说白了可以当作一种简写。。。

再观察所有的api，调用doWatch之后，返回值类型都是WatchHandler，这个类型是这样的：

```typescript
export type WatchStopHandle = () => void

export interface WatchHandle extends WatchStopHandle {
  pause: () => void
  resume: () => void
  stop: () => void
}
```

没错，这就是vue3取消监听的方法。当我们手动调用这个watch监听器的时候，我们就是在调用返回的这个WatchHandle中的函数，所以在调用之后，监听就会停止。

baseWatch中是这样实现的：

```typescript
const watchHandle: WatchHandle = () => {
    effect.stop()
    if (scope) {
      remove(scope.effects, effect)
    }
}
```

当副作用停止，监听自然也停止了。以后可以学学这个"句柄Handler"的使用方法。
