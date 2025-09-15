---
title: Unity手动混合Animator动画
published: 2024-10-10
image: ./cover.png
description:  Unity动画混合的两种方法：CrossFade和CrossFadeInFixedTime的区别和用法。
tags: [动画,Unity,游戏开发]
category: Unity笔记
draft: false
---
## 一、粗略认识一下两个用来混合的方法

之前接触过Animator里内置的混合树BlendTree，虽然好用，但是因为依附于Animator存在，所以也不是太喜欢。

最近研究Animator代码的时候偶然发现两个方法：

### **CrossFade**和**CrossFadeInFixedTime**

### （ ~看名字也能猜出来应该是用来混合动画的吧~ ）

翻了一下官方文档，用人话翻译一下就是：

> CrossFade是按照动画的自身时间进行混合。如果动画10秒，混合持续时间0.2，会在2秒后混合完成
> CrossFadeInFixedTime是按照实际时间进行混合。如果动画10秒，混合持续时间0.2，会在0.2秒后混合完成
>
> 还有一个特性：使用CrossFade或CrossFadeInFixedTime混合时，如果混合时间大于动画自身长度，动画自身会被滞留在最后一帧，直到混合结束。
>
> 所以作为一种trick，也不是不能把这个东西当成动画播放的冷却器。。。

## 二、详细了解一下这俩方法

 其实真正使用的时候， **了解上面的内容，学会咋调用其实就够了** ，但是毕竟是记录学习的博客，还是把内容都记录下来吧，也算是逼迫自己多学习一点了。

    官方文档的介绍如下：

![img](https://i-blog.csdnimg.cn/blog_migrate/77f2e1bed982ec04bd30fb9551cb8b39.png "CrossFadeInFixed介绍")

![img](https://i-blog.csdnimg.cn/blog_migrate/23625f32db28ae8a113a79c6ee6b4d38.png "CrossFade")

看完了粗略概括一下就是：

| 形参                               | 作用                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| stateName/stateHashName            | 想过渡过去的状态名字（我还是推荐使用Hash）                               |
| fixed/normalizedTransitionDuration | 过渡到该动画状态的混合时间（视原始动画而定，要么数值要么比例，自行斟酌） |
| layer                              | 发生交叉淡入淡出的图层（在Animator里设置的那个玩意）                     |
| fixed/normalizedTimeOffset         | 从多远的地方开始混合（也就是常说的偏移量）                               |
| normalizedTransitionTime           | 混合已经进行了多少（就是我们的混合结果从什么位置开始被播放）             |

**实话实说这个Unity文档写的是真的垃圾。。。后面的两个函数签名解释了个寂寞。。。害得我找了好久的解释** 。

![img](https://i-blog.csdnimg.cn/blog_migrate/76aa40e1647edddc7102962a959dcf2b.png)

这是社区里我觉得比较通俗的解释，可以去[Unity社区](https://forum.unity.com/threads/what-is-the-animator-crossfade-normalizedtransitiontime.744629/ "社区")看看。

## 三、关于后三个时间参数的理解

假设我们有从A->B进行混合过渡，

A状态持续1s，B状态持续2s，[调用函数](https://so.csdn.net/so/search?q=%E8%B0%83%E7%94%A8%E5%87%BD%E6%95%B0&spm=1001.2101.3001.7020)：

```csharp
CrossFade（"B"， 0.2f， BaseLayer， 0.05f，0.1f）;
```

我们来逐层分析计算，

0.2f表示我们的混合会使用20%的动画时间来混合

0.05f表示这个混合从动画播放了5%的地方开始取，也就是混合5%到25%的部分

这个时候我们会得到一个时间为(25% * 2) = 0.5s的混合动画，这个动画会在动画过渡的时候播放

0.1f也就是表示，当我们播放这个0.5s的混合动画，会从（10% * 0.5s）= 0.05s的地方开始播放。

大概就是这样一回事了，最后我还是要吐槽一句Unity的文档真的该更新了。。。写的太潦草了吧。。。

如果有错误也请大佬们指出来了(
