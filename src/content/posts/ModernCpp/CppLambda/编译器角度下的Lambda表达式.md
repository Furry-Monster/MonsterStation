---
title: 编译器角度下的Lambda表达式
published: 2025-09-15
description: 现代C++之Lambda表达式
image: ./cover.png
tags: [Cpp,语言]
category: 现代C++
draft: false 
lang: ''
---
Lambda表达式是现代C++在C ++ 11和更高版本中的一个新的语法糖 ，在C++11、C++14、C++17和C++20中Lambda表达的内容还在不断更新。

Lambda表达式（也称为lambda函数）是在调用或作为函数参数传递的位置处定义匿名函数对象的便捷方法。通常，lambda用于封装传递给算法或异步方法的几行代码 。

类似C#,Python这样的语言，很早就有Lambda表达式，C++的Lambda提供了更多高级特性，从编译器的角度理解它是怎么做的，对语法的认知会更上一层。

## Lambda表达式

> Lambda 表达式因数学中的 **Lambda 演算**得名，直接对应于其中的 lambda 抽象。编译器在编译时会根据语法生成一个匿名的 [**函数对象**](https://oi-wiki.org/lang/new/#%E5%87%BD%E6%95%B0%E5%AF%B9%E8%B1%A1)，以捕获的变量作为其成员，参数和函数体用于实现 `operator()` 重载。

这段写得太专业了，我们用土话来说说。

Lambda又称为匿名函数，为啥叫匿名函数呢，因为它是一个没有声明只有定义的函数对象（至少在C++中是这样）。举个例子，如果不**匿名**，我们对一个类的Sort排序有可能写成这样：

```cpp
#include <algorithm>
#include <string>
#include <vector>

using Date = std::string;

struct Person {
  std::string name;
  Date birthday;
};

std::vector<Person> peoples{{"Marie Curie", "1867-11-7"},
                            {"Albert Einstein", "1879-3-14"},
                            {"Johann Carl Friedrich Gauß", "1777-4-30"}};

void sortPeopleNoLambda() {
  // 按照姓名排序
  struct ByName {
    bool operator()(const Person& a, const Person& b) {
      return a.name < b.name;
    }
  };
  std::sort(peoples.begin(), peoples.end(), ByName{});
}
```

使用 lambda 表达式，我们让这个ByName函数类变成匿名的，因为事实上只有sort会使用ByName的调用，代码会简单一些：

```cpp
void sortPeopleWithLambda() {
  std::sort(peoples.begin(), peoples.end(), [](const Person& a, const Person& b){
    return a.name < b.name;
  });
}
```

实际上，根据[C++ 标准](https://eel.is/c++draft/expr.prim.lambda#closure-3)，编译器会把 lambda 表达式转化成类似 `struct ByName{}` 的形式。

```cpp
// lambda 表达式代码
[](const Person& a, const Person& b){
  return a.name < b.name;
}

// 编译器转成
struct __lambda_1 {
  inline bool operator(const Person& a, const Person& b) const {
    a.name < b.name;
  }

  __lambda_1() = delete; // 没有默认构造函数
  __lambda_1& operator=(const __lambda_1&) = delete; // 不能赋值
};
__lambda_1(); // 对象实例编译器自动创建的，所以不会报错
```

这就是最基本的 lambda 表达式的样子。

## lambda 表达式作为函数指针

既然上面说的是Lambda表达式最基本的样子，那肯定还有更加牛逼更加高级的样子了。

有些老代码接收函数指针，但可以传 lambda 表达式进去，这是怎么做到的呢？

```cpp
void c_style_call(int(*f)(int)) {
  std::print("return value of f(7) is {}", f(7));
}

int main() {
  // implicit convertion to function point
  c_style_call([](int i) {
    return i * i;
  });
}
```

根据 [C++标准](https://eel.is/c++draft/expr.prim.lambda#closure-8)，编译器会添加一个类型转换函数，例如上一节结构体排序的例子， lambda 会添加一个转换函数，调用是执行隐式转换，就像下面这样：

```cpp
struct __lambda_1 {
  inline bool operator(const Person& a, const Person& b) const {
    a.name < b.name;
  }

  __lambda_1() = delete; // 没有默认构造函数
  & operator=(const __lambda_1&) = delete; // 不能赋值

  // 转换为函数指针
  using __func_type = bool(*)(const Person& a, const Person& b);
  inline operator __func_type() const noexcept {
    return &__invoke;
  }

private:
  static inline bool __invoke(const Persion& a, const Person& b) {
    return a.name < b.name;
  }
};

__lambda_1(); // 对象实例编译器自动创建的，所以不会报错
```

如果要显式转换，可以用 `static_cast` ，或者一个小技巧（不推荐）：

```cpp
auto *fp_compile_error = [](int i) { return i * i; }; // compile error!

auto *fptr = static_cast<int(*)(int)>([](int i) {return i*i;}); // ok

// 小技巧：
auto *fptr2 = +[](int i) { return i * i; } // ok，+号触发了从类到函数指针的隐式转换
```

一个 *lambda-expression*  可以转换为一个 *pointer to function* 类型，当且仅当：

* *capture-list* 为空（即，lambda 没有捕获任何变量）。
* lambda 的 *parameter-declaration-clause* 和 *trailing-return-type* 与 *pointer to function* 类型兼容。

## 变量捕获

Lambda 表达式可以使用上下文的变量，例如：

```cpp
int i = 0;
int j = 0;

auto f = [=] {
  // i 和 j 是拷贝过来的
  return i == j;
}
```

`[=]` 是默认的，通常说是传值捕获。编译器会把上面的lambda表达四代码转为：

```cpp
struct __lambda_2 {
  __lambda_2(int i, int j): __i(i), __j(j) {}

  inline bool operator()() const {
    return __i == __j;
  }

private:
  int __i;
  int __j;
};
```

如果是引用捕获：

```cpp
int i = 0;
int j = 0;

auto f = [&] {
  // i 和 j 是引用
  return i == j;
}
```

lambda 表达式会转为：

```cpp
struct __lambda_2 {
  __lambda_2(int& i, int& j): __i(i), __j(j) {}

  inline bool operator()() const {
    return __i == __j;
  }

private:
  int& __i;
  int& __j;
};
```

如果是 `this` 捕获：

```cpp
struct X {
  void printAsync() {
    callAsync([this] {
      // 可以使用 X 类里的成员
      std::print("X::i={}", i);
    });
  }

private:
  int i{42};
};
```

编译器把 lambda 转为：

```cpp
struct X {
  void printAsync() {
    struct __lambda_3 {
      __lambda_3(X* _this): __this(_this) {}
      void operator()() const {
        std::print("X::i={}", __this->i);
      }
    private:
      X* __this;
    };
  }

  callAsync(__lambda_3(this));

private:
  int i{42};
};
```

## 初始化捕获

[expr.prim.lambda#nt:init-capture](https://eel.is/c++draft/expr.prim.lambda#nt:init-capture)

这是 C++14 的功能，捕获列表可以是个初始化参数了。

```cpp
int x = 4;
auto y = [&r = x, x = x+1]()->int {
  r += 2;
  return x+2;
 }();                               // Updates ::x to 6, and initializes y to 7.

auto z = [a = 42](int a) { return 1; };     // error: parameter and conceptual local variable have the same name
auto counter = [i=0]() mutable -> decltype(i) {     // OK, returns int
  return i++;
};
```

## 泛型与模板Lambda

### 泛型Lambda

lambda 表达式参数可以用 `auto` 。

```cpp
std::map<int, std::string> httpStatus {
  // ...
  {400, "Bad Request"},
  {401, "Unauthorized"},
  {404, "Not Found"}
  // ...
};

std::for_each(httpStatus.begin(), httpStatus.end(), [](auto &item) {
  std::print("{}:{}", item.first, item.second);
});
```

编译器会为 `auto` lambda 表达式类，添加一个模板。例如

```cpp
// lambda
[](auto i) { std::print("{}", i); };

// 编译器会把它改成：

struct __lambda_6 {
  template<typename T>
  void operator()(T i) const {
    std::print("{}", i);
  }

  template<typename T>
  using __func_type = void(*)(T i);

  template<typename T>
  inline operator __func_type<T>() const noexcept {
    return &__invoke<T>;
  }

private:
  template<typename T>
  static void __invoke(T i) {
    std::print("{}", i);
  }
};
__lambda_6();
```

`auto&&` 右值引用同理：

```cpp
// lambda
std::vector<std::string> v;
[&v](auto&& item) {
  v.push_back(std::forward<decltype(item)>(item));
};

// 编译器会为其构造下面的代码：

struct __lambda_7 {
  __lambda_7(std::vector<std::string>& _v): __v(v) {}

  template<typename T>
  void operator()(T&& item) const {
    __v.push_back(std::forward<decltype(item)>(item));
  }
  // ...
private:
  std::vector<std::string>& __v;
};
__lambda_6();
```

### 模板Lambda

lambda 表达式可以是个 template:

```cpp
template<typename T>
constexpr auto c_cast = [](auto x) {
  return (T)x;
}

c_cast<int>(3.14159); // => 3
```

编译器会为这个 lambda 产生下面的代码：

```cpp
template<typename T>
struct __lambda_9 {
  template<typename U>
  inline auto operator()(U x) const {
    return (T)x;
  }
};
template<typename T>
auto c_cast = __lambda_9<T>();
```

我们可以推测：

```cpp
// C++20
decltype([]{}) f1;
decltype([]{}) f2;
```

`f1` 和 `f2` 拥有不同的类型。

## 乱七八糟的新特性

### 捕获时机

```cpp
#include <print> // C++23

int main() {
  static int i{42};

  auto f = [=]{ i++; };
  f();

  std::print("{}", i); // 43!
}
```

结果不是42，而是43，因为i是static的，它也是全局变量，不能被捕获，这里的i++直接操作i本身，不作拷贝操作。

同理：

```cpp
#include <print> // C++23

int i{42};

int main() {
  auto f = []{ i++; };
  f();

  std::print("{}", i); // 43!
}
```

简单地说，如果不是 [odr-use](https://en.cppreference.com/w/cpp/language/definition) 就可以不用捕获。

```cpp
int main() {
  constexpr int i = 42;
  auto f = []{ std::print("{}", i); }; // ok, i is not odr-used
  f();

  auto f2 = []{ std::print("{}", &i); }; // Error! i is odr-used
  f2();

  auto f3 = [&] { std::print("{}", &i); }; // ok, print 42
  f3();

  const int j = 42;
  auto fj = []{ std::print("{}", j); }; // ok, i implicit constexpr
  fj();

  const float fp = 42.0f;
  auto ff = [] { std::print("{}", i); }; // Error! float is not constexpr
  ff();
}
```

:::note

* 一个变量被认为是 ODR-used，如果它的值被使用，并且它的求值需要访问它的地址。换句话说，如果编译器需要知道变量的内存地址来使用它的值，那么它就是
  ODR-used。
* 如果一个变量没有被 ODR-used，那么 lambda 表达式可以访问它的值，而无需显式捕获它。编译器可能会将该值直接嵌入到 lambda 函数对象中。

:::

### 直接调用函数表达式(IIFE)

lambda 表达式可以直接调用，不需赋值：

```cpp
int main() {
  []{ std::print("Hello world!"); } ();
}
```

lambda 表达式像函数一样可以有复杂的结构也有返回值，但可以把逻辑体写在本地：

#### 简化逻辑

这里本来要编写一个没多大用的函数，但也可以直接在本地写个 lambda 表达式把逻辑直接在原地写好。

```cpp
int main() {
  // ...

  std::vector<Foo> foos;

  foos.emplace_back([&]{
    if (hasDatabase) {
      return getFooFromDB();
    }
    return getFooFromElsewhere();
  }());
}
```

#### Call Once

某些逻辑整个程序过程中只需要运行一次，后续不再运行，这可以用 lambda 直接调用来做到：

```cpp
struct X {
  X() {
    static auto _ = []{ std::print("call once!"); return 0; }();
  }
};

X(); // "call once!"
X(); // nothing
X(); // nothing
X(); // nothing
```

### constexpr Lambda

C++17 可以给 lambda 设定 constexpr 标记。

[expr.prim.lambda#closure-5](https://eel.is/c++draft/expr.prim.lambda#closure-5)

```cpp
auto f = []() constexpr { return sizeof(void*) };
std::array<int, f()> arr{};
```

### lambda 重载表

C++17 可以用 lambda 构造一个重载表：

```cpp
#include <variant>
#include <cstdio>
#include <vector>

template<class... Ts> struct overloaded : Ts... { using Ts::operator()...; }; // (1)
template<class... Ts> overloaded(Ts...) -> overloaded<Ts...>;  // (2)

using var_t = std::variant<int, const char*>;

int main() {
  std::vector<var_t> vars = {1, 2, "Hello, World!"};

  for (auto& v : vars) {
    std::visit(overloaded {  // (3)
      [](int i) { printf("%d\n", i); },
      [](const char* str) { puts(str); }
    }, v);
  }

  return 0;
}
```

overloaded结构体接受多个函数对象（通常是 lambda 表达式）作为模板参数，并将它们组合成一个函数对象。  

这个组合后的函数对象可以根据传入参数的类型，调用相应的函数对象。

某种意义上，**这是通过variant库这个c++的新的联合体，加上Lambda重载表，实现了一个多播调用。**

### C++20 Lambda template

C++20 添加了 concept，lambda 也可以使用concept

[expr.prim.lambda#closure-7](https://eel.is/c++draft/expr.prim.lambda#closure-7)

```cpp
auto f = []<typename T1, C1 T2> requires C2<sizeof(T1) + sizeof(T2)>
         (T1 a1, T1 b1, T2 a2, auto a3, auto a4) requires C3<decltype(a4), T2> {
  // T2 is constrained by a type-constraint.
  // T1 and T2 are constrained by a requires-clause, and
  // T2 and the type of a4 are constrained by a trailing requires-clause.
};
```

### lambda 递归

lambda 递归还是有些麻烦。

```cpp
auto fact = [](this auto self, int n) -> int { // OK, explicit object parameter
  return (n <= 1) ? 1 : n * self(n-1);
};
std::cout << fact(5); // OK, outputs 120
```

## 总结

C++ 把 lambda 表达式搞得很复杂，即时理解了它的本质，也记不住它的语法和细节。

即使你把这个玩意搞懂了也不一定能信手拈来写出这种恐怖的代码，标准文档才是你唯一的家。
