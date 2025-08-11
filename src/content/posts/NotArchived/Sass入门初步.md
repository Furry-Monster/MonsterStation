---
title: Sass入门初步
published: 2024-10-12
image: ./sass.png
description: 今天换个口味，做一下样式
tags: [语言,CSS,前端]
category: 技术杂文
draft: false
---
# 区分CSS，SCSS，SASS

其实很长一段时间我都不知道SCSS和SASS为啥只需要安装：

```bash
npm install sass
```

之后就都可以使用了，后来才发现这俩只是一个东西的两个版本罢了。。。

### 一、CSS（Cascading [Style](https://so.csdn.net/so/search?q=Style&spm=1001.2101.3001.7020) Sheets）

CSS 是一种用来描述 HTML 或 XML 文档外观和格式的样式表语言。它通过定义样式规则，来控制网页元素的呈现方式。CSS 语法相对简单，直接书写样式规则。每条规则包含选择器和一组声明，声明包括属性和值。

```css
body {
  font-family: Arial, sans-serif;
  color: #333;
}

h1 {
  color: #444;
}

```

### 二、SASS（Syntactically Awesome Stylesheets）

Sass 是一个 CSS 预处理器，扩展了 CSS，添加了变量、嵌套规则、混入、继承等功能，增强了样式表的功能性和可维护性。Sass 有两种语法：缩进式语法（原始语法，文件扩展名为 `.sass`）和 SCSS 语法（CSS 超集，文件扩展名为 `.scss`）。

```scss
$primary-color: #333

body
  font-family: Arial, sans-serif
  color: $primary-color

h1
  color: darken($primary-color, 10%)

```

### 三、SCSS（Sassy CSS）

SCSS 是 Sass 的一种语法，是 CSS 的超集，这意味着所有有效的 CSS 代码在 SCSS 中同样有效。它结合了 CSS 的简单性和 Sass 的强大功能。SCSS 语法与 CSS 类似，但引入了 Sass 的所有高级功能，如变量、嵌套、混入、继承等。

```scss
$primary-color: #333;

body {
  font-family: Arial, sans-serif;
  color: $primary-color;
}

h1 {
  color: darken($primary-color, 10%);
}

```

# Bem架构

如今，有很多思想或者命名规范，例如：[OOCSS](https://link.zhihu.com/?target=http%3A//oocss.org/), [SMACSS](https://link.zhihu.com/?target=http%3A//smacss.com/), [SUITCSS](https://link.zhihu.com/?target=http%3A//suitcss.github.io/), [Atomic](https://link.zhihu.com/?target=https%3A//github.com/nemophrost/atomic-css)， 还有[BEM](https://link.zhihu.com/?target=http%3A//getbem.com/introduction/), 本文只讨论市面上比较流行的**BEM**规范，它由Yandex团队开发,其目标是帮助Developer更好的理解和抽象HTML和CSS之间的关系。

**BEM**由**B**lock(块),**E**lement(元素),**M**odifer(修饰符)三部分组成。假设你的网站由不同的模块(组件)组成，那么对应到BEM规范里面，你的组件名为Block, 每个组件里面有不同的子项为Element, 如果你的组件或者子项，有特定的状态或者行为来修饰组件或者[子项](https://zhida.zhihu.com/search?content_id=113447052&content_type=Article&match_order=3&q=%E5%AD%90%E9%A1%B9&zhida_source=entity)，那么对应的是Modifer.下面会通过一些示例来讲解

### 1.1 Block(块)

**Block**是你网站中的一个模块或者组件，假设你网站中由Header,Content, Sidebar, Footer组件组成，那么他们都是Block,需要注意的是Block 是CSS[作用域链](https://zhida.zhihu.com/search?content_id=113447052&content_type=Article&match_order=1&q=%E4%BD%9C%E7%94%A8%E5%9F%9F%E9%93%BE&zhida_source=entity)的顶端。

```html
// HTML 
<div id="website">
   <Header />
   <Content />
   <SideBar />
   <Footer />
</div>

// Header component
<div className="header">Header</div>

// Content component
<div className="content">Content</div>

// Sidebar component
<div className="sidebar">Sidebar</div>

// Footer component
<div className="footer">Footer</div>

// CSS
.header {
    /* style * /
}
.content {
    /* style * /
}
.sidebar {
    /* style * /
}
.footer {
    /* style * /
}
```

### 1.2 Element(元素)

**Element**代表的是**Block**中某一个特定的项，它通过 **与连接Block, "**"的意义是声明Element与Block之间的父子关系，例如Content 组件里面包含一个form 表单，包含一些描述信息的段落，等等。

```html
// HTML
<div className="content">
   <form className="content__form"></form>
   <p className="content__description"></p>
   <div className="content__item"></div>
</div>
//CSS
.content__form{} //表达的意思是content 下的form
.content__description{} //表达的意思是content 下的description
.content__item{} //表达的意思是content 下的item
```

### 1.3 Modifier(修饰符)

**Modifier**是用来描述**Block**或者**Element**的变体。它用"--"与**Block**或者**Element**连接，例如我们的Button 组件，它有很多的状态和外观，例如selected,default,disabled,按钮的颜色可能有green,red,orange.这些都属于Modifier.

```html
//HTML
<div className="button button--{props.theme} button--{props.status}"></div>

//CSS
.button--default{}
.button--selected{}
.button--disabled{}
.button--green{}
.button--red{}
...
```

BEM 由 Block, Element, Mdifier 三部分组成。每个部分描述不同的意义。Elment 通过"__" 于 Block连接，它声明了父子关系。Modifier 通过"--"与Block或者Element连接，用来描述作用者的状态或者行为。

 **优点** :

* "__"描述元素父子关系
* 减少CSS层级嵌套问题
* CSS与HTML的映射关系
* 类名合乎逻辑且直观
* 给团队提供了一种声明式语法

**缺点**

* 额外的学习成本
* 类名变的更长
* Block的抽象至关重要

# 使用SCSS实现Bem架构

在vite项目中创建一个 `bem.scss`文件：

bem.scss

```scss
//命名空间
$namespace: "bem" !default;

//选择器 规则
$block-sel: "-" !default;
$elem-sel: "__" !default;
$mod-sel: "--" !default;

//css清除覆盖
@mixin bfc{
  height:100%;
  overflow:hidden;
}

//块 混合器
@mixin b($block) {
  $B: #{$namespace + $block-sel + $block};
  .#{$B} {
    @content;
  }
}

//元素 混合器
@mixin e($el) {
  $selector: &;
  @at-root {
    #{$selector + $elem-sel + $el} {
      @content;
    }
  }
}

//修饰 混合器
@mixin m($m) {
  $selector: &;
  @at-root {
    #{$selector + $mod-sel + $m} {
      @content;
    }
  }
}
```

咋使用呢？参考这个例子：

```html
<template>
    <div class="bem-menu">
        <h1>Menu</h1>
        <div class="bem-menu__list">
            <ul class="bem-menu__ul">
                <li class="bem-menu__item">Home</li>
                <li class="bem-menu__item">About</li>
                <li class="bem-menu__item">Contact</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

</script>

<style lang="scss" scoped>
@include b(menu) {
    min-width: 300px;
    border-right: 1px solid #ccc;
    height: 100%;

    @include e(list){
        height: 100%;
        overflow-y: auto;
    }

    @include e(ul){
        list-style: none;
        margin: 0;
        padding: 0;
    }

    @include e(item){
        padding: 10px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover{
            background-color: #f5f5f5;
        }
    }
}
</style>
```

# 自顶向下认识SCSS

从上面的例子可以发现scss几个基本的功能：

### 一、嵌套CSS

可以看到我们用@include的时候，@include里面也可以用@include，也就是说，css可以按照树形结构进行嵌套。

原版css中是这样的：

```css
#content article h1 { color: #333 }
#content article p { margin-bottom: 1.4em }
#content aside { background-color: #EEE }
```

scss中可以这样写：

```scss
#content {
  article {
    h1 { color: #333 }
    p { margin-bottom: 1.4em }
  }
  aside { background-color: #EEE }
}
```

### 二、模块化导入

> `css`有一个特别不常用的特性，即 `@import`规则，它允许在一个 `css`文件中导入其他 `css`文件。然而，后果是只有执行到 `@import`时，浏览器才会去下载其他 `css`文件，这导致页面加载起来特别慢。
>
> `sass`也有一个 `@import`规则，但不同的是，`sass`的 `@import`规则在生成 `css`文件时就把相关文件导入进来。这意味着所有相关的样式被归纳到了同一个 `css`文件中，而无需发起额外的下载请求。另外，所有在被导入文件中定义的变量和混合器（参见2.5节）均可在导入文件中使用。

### 三、混合器mixer

一个这样的混合器

```scss
@mixin rounded-corners {
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
```

可以这样使用：

```scss
notice {
  background-color: green;
  border: 2px solid #00aa00;
  @include rounded-corners;
}

//编译后：
.notice {
  background-color: green;
  border: 2px solid #00aa00;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
```

除此之外，还有其他的特性，在这里就不做介绍了，这里只介绍简单的开发能用上的一些特性。
