---
title: Vue重学计划（二）
published: 2024-10-07
description:  第二期，我们从比较~~基础~~的部分入手，来做一个深入的认知
tags: [Vue,前端,源码]
category: Vue重学计划
draft: false
---
第二期，我们从比较~~基础~~的部分入手，来做一个深入的认知

# Nodejs的源码结构

提到基础，就不得不说这个伟大的Nodejs了，为啥说它伟大呢？

> **在JavaScript语言努力摆脱“玩具语言”这个标签的进化历程中，Node.js绝对能记下浓墨重彩的一笔。** Node.js并不是一个用于实现具体功能的第三方工具库，而是JavaScript程序的运行环境。

在Node.js出现之前，使用JavaScript语言编写的脚本需要在网页中被 `<script>`标签引用后才能执行，这就使得前端开发人员编写的程序无论怎么看都像是界面的一种附属品。 **而Node.js的出现打破了这个枷锁** ，它提供的运行时能够让JavaScript程序在桌面、命令行终端、手机、平板电脑甚至**嵌入式系统**上运行，这不仅极大地丰富了JavaScript的应用场景，也为后来的前端工程化发展和中间层架构模型的兴起奠定了基础。

## Nodejs是什么？

> Node.js是一个基于Chrome V8引擎的JavaScript运行环境。Node.js使用了一个事件驱动的、非阻塞式I/O的模型，轻量又高效，它的底层是用C/C++编写的。这是Node.js的官方描述，对前端开发人员来说，想要搞清楚其中所包含的“引擎”“运行环境”“事件驱动”以及“非阻塞I/O模型”到底是什么意思，并不是一件容易的事情。

要理解这段话和它背后的真正力量，我们需要把 Node.js 拆分到组件，了解它们的关键技术，如何交互协作，最终构成了 Node.js 这个强大的运行时环境.

它们是这样分工的：

[**V8**](https://link.segmentfault.com/?enc=MWhl%2F932Qfdc%2Fd2nsfxM1w%3D%3D.NpNMHIW68G85VeQTb2pVJYVR%2B76WIEx4lEh2iauvIsrUz%2B%2FQFq16aEfCNhrue2eu)：Google 开源的高性能 JavaScript 引擎，以 C++ 实现。这也是集成在 Chrome 中的 JS 引擎。V8 将你写的 JavaScript 代码编译为机器码（所以它超级快）然后执行。V8 有多快？看看[这个爆栈网的回答](https://link.segmentfault.com/?enc=85Hko9%2BRFa%2FPHvH6byDwBg%3D%3D.cvVPo%2Fvph0VGeFW2VswA%2BLxNCktK7Rs69h3hS0IjKjzHa7xF%2BRQ2u1dxAgOXmxC2)。

[**libuv**](https://link.segmentfault.com/?enc=slfyaTN7z1%2BCOe%2ByH761uA%3D%3D.WOb9nQmmJohdgx6Sj2%2BLjedEKBU%2BKTZqdgaxqcdjcKc%3D)：提供异步功能的 C 库。它在运行时负责一个事件循环（Event Loop）、一个线程池、文件系统 I/O、DNS 相关和网络 I/O，以及一些其他重要功能。

[**其他 C/C++ 组件和库**](https://link.segmentfault.com/?enc=0kBZVWiXq2aOlCa2R4T2Tg%3D%3D.ky0ULR0KXFBIyFMKIQLnkfFTMPcH6si7zNLwBBml15NTXk94ayOUxHV2TAZiiv8Q3ZDrF2NsFdlAnRw%2FKuIThQ%3D%3D)：如 [c-ares](https://link.segmentfault.com/?enc=ljzvhrP4oxpKXqGuB%2FMTjw%3D%3D.H%2BP8XnrlZDjyC6sXDHad1ZFmHLFY5QwnrzTo7VqIYEU%3D)、[crypto (OpenSSL)](https://link.segmentfault.com/?enc=sLZtgHX0oRJ1mjoA3g31Hw%3D%3D.%2B%2FrNH9%2FqMc1MEj5sYCc3awBrN0yDxe8rrFUMJsGdHjM%3D)、[http-parser](https://link.segmentfault.com/?enc=wFIzBKRhoLqtd9Wy8NbsNQ%3D%3D.B5uJaDqo%2BF29QTGd3xRroOEm5kD2rEHnA4IfrVypsjt9jjWQ%2FqCbOs8j8M59bqUN) 以及 [zlib](https://link.segmentfault.com/?enc=jh8FDMyJypJAtJdXiD5iWQ%3D%3D.A5hQTM%2FGaw5zRWE1dJQntOYG9A%2BNCTkCPz1W2YfPzSc%3D)。这些依赖提供了对系统底层功能的访问，包括网络、压缩、加密等。

## 架构方面的热门讨论

在Stack Overflow上，关于这个架构有一个热门的讨论[javascript - Which is correct Node.js architecture? - Stack Overflow](https://stackoverflow.com/questions/36766696/which-is-correct-node-js-architecture/37512766#37512766)

原文在此：[Architecture of Node.js’ Internal Codebase | by Aren Yanqi Li | Yet Another Node.js Blog | Medium](https://medium.com/yet-another-node-js-blog/architecture-of-node-js-internal-codebase-57cd8376b71f)

# Vite项目架构重点解读

## 源码类文件

public 下面的不会被编译 可以存放静态资源

assets 下面可以存放可编译的静态资源

components 下面用来存放我们的组件

App.vue 是全局组件

main.ts 是全局的ts文件

**index.html 一个有意思的入口文件**

为什么说index.html是一个有意思的文件？用过纯Vue或者Vue-cli生成项目的朋友应该发现了，只有Vite生成的项目里面是自带这个html入口的

Vite文档给出了解答：

> 您可能已经注意到，在 Vite 项目中，`index.html` 是核心，而不是隐藏在 `public` 中。这是有意的：在开发过程中，Vite 是一个服务器，而 `index.html` 是您应用程序的入口点。
>
> Vite 将 `index.html` 视为源代码和模块图的一部分。它解析引用您的 JavaScript 源代码的 `<script type="module" src="...">`。即使是内联 `<script type="module">` 和通过 `<link href>` 引用的 CSS 也能享受 Vite 特定的功能。此外，`index.html` 中的 URL 会自动重新定位，因此不需要特殊的 `%PUBLIC_URL%` 占位符。
>
> 与静态 http 服务器类似，Vite 有一个“根目录”的概念，您的文件将从该目录提供服务。您将在本文档的其余部分中看到它被引用为 `<root>`。您源代码中的绝对 URL 将使用项目根目录作为基准进行解析，因此您可以像使用普通的静态文件服务器一样编写代码（但功能更强大！）。Vite 还能够处理解析到根目录之外的文件系统位置的依赖项，这使得它即使在基于单仓库的设置中也能使用。
>
> Vite 还支持具有多个 `.html` 入口点的 [多页面应用程序](https://vite.vuejs.ac.cn/guide/build#multi-page-app)。

事实上，**webpack，rollup 他们的入口文件都是enrty input 是一个js文件 而Vite 的入口文件是一个html文件，他刚开始不会编译这些js文件 只有当你用到的时候 如script src="xxxxx.js" 会发起一个请求被vite拦截这时候才会解析js文件**

## 配置类文件

vite config ts 等等后面再说。

# npm run dev 指令

**npm run dev** 指令会再package.json中被解析成**vite**这个指令，这个vite其实就是启动vite 服务器的指令。

那为什么我们不直接执行vite 命令不是更方便吗？

这是因为在我们的电脑上面并没有配置过相关命令 所以无法直接执行,不信你可以在你的项目中输入vite，正常情况应该都不能执行，可以执行的都是自行配置过的

 其实在我们执行npm install 的时候（包含vite） 会在node_modules/.bin/ 创建好可执行文件

.bin 目录，这个目录不是任何一个 npm 包。目录下的文件，表示这是一个个软链接，打开文件可以看到文件顶部写着 #!/bin/sh ，表示这是一个脚本

在我们执行npm run xxx  npm 会通过软连接 查找这个软连接存在于源码目录node_modules/vite

所以npm run xxx 的时候，就会到 node_modules/bin中找对应的映射文件，然后再找到相应的js文件来执行

1.查找规则是先从当前项目的node_modlue /bin去找,

2.找不到去全局的node_module/bin 去找

3.再找不到 去环境变量去找

至于node_modules/.bin中的三个文件：

```bash
# unix Linux macOS 系默认的可执行文件，必须输入完整文件名
vite
 
# windows cmd 中默认的可执行文件，当我们不添加后缀名时，自动根据 pathext 查找文件
vite.cmd
 
# Windows PowerShell 中可执行文件，可以跨平台
vite.psl
```

我们使用**windows** 一般执行的是第二个，而MacOS Linux 一般是第一个。

详情可以参考：[学习Vue3 第三章（Vite目录 &amp; Vue单文件组件 &amp; npm run dev 详解）_npm run dev vite-CSDN博客](https://xiaoman.blog.csdn.net/article/details/122771007)

# 比较罕见的几个vue模板指令

> Vue指令大全：
>
> v- 开头都是vue 的指令
>
> v-text 用来显示文本
>
> v-html 用来展示富文本
>
> v-if 用来控制元素的显示隐藏（切换真假DOM）
>
> v-else-if 表示 v-if 的“else if 块”。可以链式调用
>
> v-else v-if条件收尾语句
>
> v-show 用来控制元素的显示隐藏（display none block Css切换）
>
> v-on 简写@ 用来给元素添加事件
>
> v-bind 简写:  用来绑定元素的属性Attr
>
> v-model 双向绑定
>
> v-for 用来遍历元素
>
> v-on修饰符(.stop/.once等等) 用于冒泡相关操作
>
> v-once 性能优化，只渲染一次
>
> v-memo 性能优化，会有缓存

这里面，基本上没怎么用过的是v-once和v-memo，可以参考这篇文章：[Vue3.2 新增 v-memo](https://juejin.cn/post/7180973915580137527)

后面有机会也要自己试试嘞！
