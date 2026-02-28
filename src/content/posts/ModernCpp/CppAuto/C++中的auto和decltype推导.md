---
title: C++中的类型推导(auto/decltype)
published: 2026-02-28
description: 现代C++之类型推导
image: ./cover.png
tags: [Cpp,语言]
category: 现代C++
draft: false 
lang: ''
---
## **decltype** 表达式推导

`decltype` 是 C++11 加入的一个重要特性。 它允许求一切**合法表达式**的类型。从而，让从类型到值，从值到类型形成了一个闭环， 极大的扩展了泛型编程的能力。

`C++` 规范中，对于 `decltype` 类型推演规则的定义如下：

> 1. 若实参为无括号的 **标识表达式** 或无括号的 **类成员访问表达式** ，则 `decltype` 产生以此表达式命名的实体的类型。 若无这种实体，或该实参指名某个重载函数，则程序非良构。
> 2. 若实参是其他类型为 `T` 的任何表达式，且
>
>    1. 若 表达式 的值类别为 **速亡值** ，则 `decltype` 产生 `T&&` ；
>    2. 若 表达式 的值类别为 **左值** ，则 `decltype` 产生 `T&` ；
>    3. 若 表达式 的值类别为 **纯右值** ，则 `decltype` 产生 `T` 。
>
>    若表达式是 **纯右值** ，则不从该纯右值 **物质化** 临时对象：这种纯右值无结果对象。
>
> 注意如果对象的名字带有括号，则它被当做通常的 **左值** 表达式，从而 `decltype(x)` 和 `decltype((x))` 通常是不同的类型。

这些规则，初看起来，有些让人困惑。但如果真的理解了背后的机制，其实非常容易理解。

`decltype` 有两种表达方法：

1. 有括号：`decltype((expr))`
2. 无括号：`decltype(expr)`

从格式上来看，decltype 很像sizeof——用来推导表达式类型大小的操作符。类似于 sizeof，decltype 的推导过程是在编译期完成的，并且不会真正计算表达式的值。

### 有括号语意

有括号的表达方法，语意是简单而统一的：它站在表达式类别的角度求类型。

1. 如果表达式属于 **纯右值** ，结果必然是 **非引用** 类型；
2. 如果表达式属于 **泛左值** ，结果必然是 **引用** 类型；
   * 如果表达式属于 **左值** ，结果必然是 **左值引用** ；
   * 如果表达式属于 **速亡值** ，结果必然是 **右值引用** ；

```cpp
struct Foo { int a; };

using Func  = Foo& ();
using Array = char[2];

enum class E { OK, FAIL };

const Foo f_v();
Foo&      f_ref();
Foo&&     f_r();

int        a    = 0;
const int  b    = 1;
const Foo  foo  = {10};
Foo&&      rref = Foo{1};
const Foo& ref  = foo;
char       c[2] = {1, 2};
int*       p    = &a;
const Foo* pFoo = &foo;

// 左值
decltype((a))       v1;   // int&
decltype((foo))     v2;   // const Foo&
decltype((foo.a))   v3;   // const int&
decltype((f_ref())) v4;   // Foo&
decltype((f_r))     v5;   // Foo&& (&)()
decltype((c))       v6;   // char (&)[2]
decltype((a += 10)) v7;   // int&
decltype((++a))     v8;   // int&
decltype((c[1]))    v9;   // char&
decltype((*p))      v10;  // int&
decltype((p))       v11;  // int*&
decltype((pFoo))    v12;  // const Foo*&
decltype((pFoo->a)) v13;  // const int&
decltype((Foo::a))  v14;  // int&
decltype((rref))    v15;  // Foo&
decltype((ref))     v16;  // const Foo&
decltype((a > 0 ? a : b))              v;  // int&
decltype((static_cast<Func&&>(f_ref))) f;  // Foo& (&)()

// 纯右值
decltype((1+2))         v1;   // int
decltype((Foo{10}))     v2;   // Foo
decltype((f_v()))       v3;   // const Foo
decltype((Array{0, 1})) v4;   // char[2]
decltype((a++))         v5;   // int
decltype((&b))          v6;   // const int*
decltype((OK))          v7;   // E
decltype((a > 0 ? 10 : Foo{0}.a)) v;  // int

// 速亡值
decltype((Foo{10}.a))    v1;  // int&&
decltype((f_r()))        v2;  // Foo&&
decltype((Array{}[0]))   v3;  // char&&
decltype((std::move(a))) v4;  // int&&
decltype((a > 0 ? Foo{1}.a : Foo{0}.a)) v;  // int&&
```

这其中，最有趣的是 `decltype((rref))` ，`rref` 本身的类型是一个右值引用 `Foo&&` ，但做为左值表达式， 它的类型却是 `Foo&` 。

### 无括号语意

无括号的情况下，除了一种例外，其它情况下，都与有括号场景一致。

这个例外就是对于变量（包括常量）名字的直接求类型。这种情况，会返回变量被定义时的类型。

```cpp
struct Foo { int a; };

using Func  = Foo& ();
using Array = char[2];

const Foo f_v();
Foo&      f_ref();
Foo&&     f_r();

int a           = 0;
const int  b    = 1;
const Foo  foo  = {10};
Foo&&      rref = Foo{1};
const Foo& ref  = foo;
char       c[2] = {1, 2};
int*       p    = &a;
const Foo* pFoo = &foo;

decltype(a)        v1;   // int
decltype(b)        v2;   // const int
decltype(foo)      v3;   // const Foo
decltype(ref)      v4;   // const Foo&
decltype(rref)     v5;   // Foo&&
decltype(c)        v6;   // char[2]
decltype(p)        v7;   // int*
decltype(foo.a)    v8;   // int
decltype(ref.a)    v9;   // int
decltype(rref.a)   v10;  // int
decltype(pFoo)     v11;  // const Foo*
decltype(pFoo->a)  v12;  // int
decltype(Foo{1).a) v13;  // int
decltype(Foo::a)   v14;  // int
```

从例子中不难看出，对于所有的变量访问，无论直接还是间接， 由于每个变量在定义时都有自己的类型，因而求类型的结果就是这些变量被定义时的类型。

所以，之所以会出现有括号，无括号两种用法，正是因为每一个被定义的变量，都面临着两种需求：

1. 它们被定义时的类型
2. 整体做为一个表达式的类型（一定是泛左值）

前者是不关心表达式的，比如 `decltype(Foo{1}.a)` ，它只关心 `a` 被定义时的类型：`int`； 而不关心整个表达式本身是一个 `xvalue` ，因而表达式必然应该是一种右值引用类型：`int&&` 。

正是对于变量有这两种需求的存在，而其它表达式没有这样的问题，所以，才专门为变量定义了两种求类型的方法。而对于其它表达式则两种方式无差别。

## **auto** 类型推演

`auto` 类型推演脱胎于模版函数的类型推演，它们的能力几乎等价（除了初始化列表的情况）。 这也就意味着，其实在 `C++11` 之前，`C++` 早就具备了 `auto` 的能力，只是没有从语法上允许而已。

:::note

在早期C/C++中auto的含义是：使用auto修饰的变量，是具有自动存储器的局部变量，但遗憾的是一直没有人去使用它，使用方式类似：

```cpp
int a = 10 ;  //拥有自动生命期
auto int b = 20 ;//拥有自动生命期
static int c = 30 ;//延长了生命期
```

C++11中，标准委员会赋予了auto全新的含义即：auto不再是一个存储类型指示符，而是作为一个新的类型指示符来指示编译器，auto声明的变量必须由编译器在编译时期推导而得。

:::

### **auto** 的语意

和直觉不同的是，对于任意表达式：`auto v = expr` ，`v` 的类型并不总是和 `expr` 所返回的类型一致。

首先，`auto` 不可能是一个 **引用** ，无论是 **左值引用** ，还是 **右值引用** ，所以，如果 `expr` 返回类型里 包含任何引用，都会被舍弃。比如：

```cpp
Foo foo{1};
Foo& ref = foo;
Foo&& rref = Foo{2};

Foo& getRef();
Foo&& getRref();

auto v1 = ref;        // v1 type: Foo
auto v2 = rref;       // v2 type: Foo
auto v3 = getRef();   // v3 type: Foo
auto v4 = getRref();  // v4 type: Foo
```

其次，所有对值所修饰的 `const` 都会被丢弃。 比如：

```cpp
const Foo foo{1};
const Foo& ref     = foo;
const Foo&& rref   = Foo{2};
const Foo* const p = &foo;

auto v1 = foo;   // Foo
auto v2 = ref;   // Foo
auto v3 = rref;  // Foo
auto v4 = p;     // const Foo*
```

究其原因，是因为这种直接给出 `auto` 的写法，是一种 `copy/move` 语意。因而，等号右边的表达式本身类型是引用，并不影响 等号左侧对象本身不是引用；同样的，等号右边表达式本身的 **constness** ，`copy/move` 后，并不会影响新定义变量 的 **constness** 。

其推演语意，完全等价于：

```cpp
template <typename T>
void f(T value);
```

其中 `T` 就是 `auto` ，`value` 就是你用 `auto` 所定义的变量。

也就是说，`auto`使用的是 **模板实参推断**  *（Template Argument Deduction）* 的机制。`auto`被一个虚构的模板类型参数 `T`替代，然后进行推断，即相当于把变量设为一个函数参数，将其传递给模板并推断为实参，`auto`相当于利用了其中进行的实参推断，承担了模板参数 `T`的作用。

而 `auto`类型变量不会是引用类型 *（模板实参推断的规则）* ，所以要用 `auto&` *（C++14支持直接用 `decltype(auto)`推断原始类型）*。

但请注意，到了 `C++17` 之后， 并非所有的场景下，都是 `copy/move` 语意， 比如 `auto v = Foo{1}` ， 其行为完全等价于： `Foo v{1}`  。

因而，更准确的说，这不是 `copy/move` 语意，而属于构造初始化语意。

### 引用及 **const**

因而，如果你希望让新定义的变量属于引用类型，或具备 `const` ，则需要明确指定。比如：

```cpp
auto        foo  = Foo{1};
const auto& ref  = foo;
auto&&      rref = Foo{2};
```

而指针的情况则稍有特殊。

### 指针

当你不指定指针的情况下，如果等号右侧的表达式是一个指针类型，那么左侧的变量类型当然也是一个指针。

当你明确指定指针的情况下，则是要求右侧表达式必须是一个指针类型。

```cpp
Foo foo{1};
Foo* pFoo = &foo;

auto  v1 = foo;  // v1 type: Foo
auto  p1 = pFoo; // p1 type: Foo*
auto* p2 = pFoo; // p2 type: Foo*
auto* p3 = foo;  // Error: foo is not a pointer
```

### 通用引用

更为特殊的是 `auto&& v = expr` 的表达式。这并不必然导致 `v` 是一个右值引用。而是取决于 `expr` 的类别。

* 如果 `expr` 是一个 **左值** 表达式，那么 `v` 将是左值引用类型；
* 如果 `expr` 是一个 **右值** 表达式，那么 `v` 将会是右值引用类型。

```cpp
Foo   foo{1};
Foo&  ref = foo;
Foo&& rref = Foo{2};
Foo&& getRref();
Foo&  getRef();
Foo   getFoo();

auto&& v1 = foo;            // v1 type: Foo&
auto&& v2 = Foo{2};         // v2 type: Foo&&
auto&& v3 = getRref();      // v3 type: Foo&&
auto&& v4 = getRef();       // v4 type: Foo&
auto&& v5 = getFoo();       // v5 type: Foo&&
auto&& v6 = ref;            // v6 type: Foo&
auto&& v7 = rref;           // v7 type: Foo&
```

正是因为这样的写法，允许等号右侧是任意合法的表达式，而等号左侧总是可以根据表达式类别，推演出合适的引用类型。所以这种写法被称做 **通用引用** 。

其中，我们可以清晰的看出，虽然 `ref` 和 `rref` 分别被定义为 **左值引用** 和 **右值引用** ，但它们做为左值来讲，是等价的。都是左值引用。

### 初始化列表

由于初始化列表不是一个表达式，因而类型也就无从谈起。所以 `C++14` 对其做了特殊的规定：

* 如果使用 **直接初始化** （不用等号）的方式，比如：`auto i{1}` ，则初始化列表只允许有一个元素，其等价于 `auto i = 1`； 如果初始化列表超过一个元素，比如 `auto j{1,2}` ，则编译失败。
* 如果使用 **拷贝初始化** （用等号）的方式，比如：`auto v = {1, 2}` ，则初始化列表允许有多个同一类型的元素。 其等价于 `std::initializer_list<int> v = {1, 2}` 。而 `auto v = {1}` 则等价于 `std::initializer_list<int> v = {1}` 。

### **decltype(auto)**

由于 `auto` 推演总是会丢弃 **引用** 及 `const` 信息，明确给出 **引用** 又总是得到一个引用。明确给出 `const` ， 则总是得到一个 `const` 类型。这对于想精确遵从等号后面类型的情况非常不便，尤其在进行泛型编程时，很难通过 auto 符合通用的情况。

而 `decltype` 恰恰相反，它总是能准确捕捉右侧表达式的类型。因而，我们可以这样写：

```cpp
Foo foo{1};
const Foo& ref = foo;
Foo&& rref = Foo{2};
int a = 0;

decltype(foo)    v1 = foo;   // Foo
decltype((foo))  v2 = foo;   // Foo&
decltype(ref)    v3 = ref;   // const Foo&
decltype(rref)   v4 = rref;  // Foo&&
decltype((rref)) v5 = rref;  // Foo&
decltype(1+2)    v6 = 1 + 2; // int

decltype((a > 0 ? Foo{0}.a : Foo{1}.a)) v7 = \
   a > 0 ? Foo{0}.a : Foo{1}.a; // int&&
```

但这样的写法，总是要把右边的表达式在 `decltype` 里重复写一遍，才能做到。到了 `C++14` ， 推出了一种新的写法：`decltype(auto)` ， 其中 `auto` 是一个自动占位符，代表等号右侧的表达式，这就大大简化了程序员的工作：

```cpp
decltype(auto)   v1 = foo;    // Foo
decltype(auto)   v2 = (foo);  // Foo&
decltype(auto)   v7 = (a > 0 ? Foo{0}.a : Foo{1}.a); // int&&
```

### 函数返回值类型的自动推演

到了 `C++14` 之后，对于普通函数的返回值自动推演，可以通过 `auto` 来完成，比如：

```cpp
auto f() { return Foo{1}.a; } // 返回值类型为int
```

当然，如果希望返回值类型运用 `decltype` 规则，则可以用 `decltype(auto)` 。比如：

```cpp
auto f() -> decltype(auto) { // 返回值为int&&
  return (Foo{1}.a);
}
```

### 非类型模版参数

```cpp
template <auto V>
struct C
{
   // ....
};

C<10>   a; // C<int>
C<'c'>  b; // C<char>
C<true> c; // C<bool>
```

### 函数模版的便捷写法

```cpp
template <typename T1, typename T2>
auto add(T1 lhs, T2 rhs) {
   return lhs + rhs;
}
```

到了 `C++20` ，允许让普通函数可以有更加便捷的写法：

```cpp
auto add(auto lhs, auto rhs) {
   return lhs + rhs;
}
```

当然，如果你想指明两个参数属于同一种类型，但另外的参数没有这样的约束，则仍然需要写模版头：

```cpp
template <typename T>
auto f(T a, auto b, T c, auto d); // a, c 必须同一类型，b, d 各自有各自类型
```

其等价于：

```cpp
template <typename T, typename T1, typename T2>
auto f(T a, T1 b, T c, T2 d);
```

## 总结

C++的 `decltype`和 `auto`逻辑并不复杂，但是因为C++的历史包袱，具备一些奇怪的机制，导致容易出现一些奇奇怪怪的bug，按照C++的惯例，这些机制的修复将会是很久以后的事了，说不定以后就会出现：

> C++77 是一次重大的更新，引入了许多新特性：
>
> * 智能协程 (auto **Coroutines**)
> * 智能范围 (auto **Ranges**)
> * 智能概念与约束 (auto **Constraints and concepts**)
> * 智能指定初始化 (auto **designated initializers**)
> * 智能绑定参数（auto param）
>
> 以下是实现特定功能的示例程序：
>
> ```cpp
> import auto; //use auto programing
> auto auto(auto auto){
>   auto& auto = auto<auto>(); 
>   auto auto = [&](auto auto,auto auto) -> auto {
>     if(auto > auto) {
>       return auto;
>      }
>   }
>   auto(auto,auto); 
>   auto("%auto",auto); 
>   return auto; 
> }
> ```
