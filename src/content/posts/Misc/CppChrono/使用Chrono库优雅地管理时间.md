---
title: 使用Chrono库优雅地管理时间
published: 2025-09-04
description: 现代C++之chrono时间库
image: ./cover.png
tags: [Cpp,语言]
category: 现代C++
draft: false 
lang: ''
---
最近在写自己的游戏引擎项目的时候，为了管理引擎Tick，学习了一下别人的经验，了解到除了图形框架之外，手动管理时间，不仅仅只有 `ctime`库作为选择。还有更优雅的 `chrono`库。

`chrono`是一个time library, 源于 `boost`，现在已经是C++标准。`chrono`是一个模版库，使用简单，功能强大，只需要理解三个概念：`duration`、`time_point`、`clock`

## 引入

我们先来想一个问题，如何用C++获取当前时间？

在三个层次，我们可以有三种方法：

### 系统API

```cpp
#include <iostream>
using namespace std;

int main()
{
    // 获取并打印当前系统时间
    system("time");
}
```

### ctime 标准库

```cpp
#include <iostream>
#include <ctime>
using namespace std;

int main()
{
    // 获取当前系统时间
    time_t now = time(0);
    // 转为本地时间结构体
    tm *ltm = localtime(&now);
    // 打印年月日等
    cout << "Year: " << 1900 + ltm->tm_year << endl;
    cout << "Month: " << 1 + ltm->tm_mon << endl;
    cout << "Day: " << ltm->tm_mday << endl;
    cout << "Time: " << ltm->tm_hour << ":";
    cout << ltm->tm_min << ":";
    cout << ltm->tm_sec << endl;
}
```

## chrono 标准库

```cpp
#include <iostream>
#include <chrono>
#include <ctime>
using namespace std;

int main()
{
    // 获取当前系统时间
    auto now = chrono::system_clock::now();
    // 转换为 std::time_t 类型
    auto time = chrono::system_clock::to_time_t(now);
    // 打印时间
    cout << ctime(&time) << endl;
}
```

不难看出，chrono库在提供了高级特性的同时，操作也比ctime库要简洁许多！

## unix timestamp：时间戳

时间戳是计算中广泛使用的日期和时间表示形式。它通过自1970年1月1（Unix 纪元）00：00：00 UTC以来经过的秒数(秒是毫秒、微妙、纳秒的总称)来测量时间，没有因闰秒而进行调整。

## chrono库的主要组成

chrono库是C++11中的一个标准库，它提供了一系列与时间相关的类和函数，用于表示和处理时间间隔，时钟和时间点，C++20新增Calendar。

chrono库主要包含了以下四种类型：

### Duration

* Duration(时间间隔)：表示一段时间的长度，由一个数值(以下_Rep数值类型）和一个单位（ratio）组成，可以用于表示网络时延、程序执行耗时等

```cpp
			//define in std::chrono namspace
    /// `chrono::duration` represents a distance between two points in time
    template<typename _Rep, typename _Period = ratio<1>>
      class duration;
			//库中预先定义了常用的时间长度
```

* count --成员函数 返回周期的统计数值
* std::chrono::duration_cast 类型转换方法
* 例子

```cpp
  std::chrono::seconds d1(100);
  std::chrono::seconds d2(50);
  //d1: 100 d2: 50
  std::cout << "d1: " << d1.count()  << " d2: " << d2.count() << std::endl;
  std::chrono::seconds d3 = d1 - d2; //同单位基本计算
  std::cout << "d3: " << d3.count() << std::endl; //d3: 50
 //std::chrono::duration_cast 使用
   std::chrono::milliseconds m = std::chrono::duration_cast<std::chrono::milliseconds>(d1);
  //100s == 100000ms
  std::cout << "100s == " << m.count() << "ms" << std::endl;
 //其他用法，当前线程休眠 1s sleep_for 需要加 #include<thread>
  std::this_thread::sleep_for(std::chrono::seconds(1));

```

### Clock

* 时钟（clock）：表示一个可以测量时间的设备，提供了当前时间点（now）和时间点之间的差值（time_since_epoch）等方法。chrono库提供了三种时钟，分别是：
  * 系统时钟（system_clock）：表示当前系统范围的实时日历时钟，通常与系统的钟同步。它可以用于表示日期和时间，以及与其他系统交互。
  * 稳定时钟（steady_clock）：表示一个单调递增的时钟，不受系统时间的调整或修改影响。它可以用于测量时间间隔，以及实现定时器和延时等功能。
  * 高分辨率时钟（high_resolution_clock）：表示一个具有最高精度的时钟，通常是系统时钟或稳定时钟的别名（using high_resolution_clock = system_clock;）。它可以用于测量极短的时间间隔，以及实现性能分析等功能。
* now --成员函数，放回当前时钟的时间点

### TimePoint

* 时间点（time_point）：表示一个特定时刻，由一个时钟和一个时间间隔组成。例如，`std::chrono::system_clock::now()`表示系统时钟的当前时间点，`std::chrono::steady_clock::now()`表示稳定时钟的当前时间点，等等。chrono库还提供了一些常用的时间点别名，如 `std::chrono::system_clock::time_point`，`std::chrono::steady_clock::time_point`，`std::chrono::high_resolution_clock::time_point`等。
* **time_since_epoch** 返回到epoch的时间间隔Duration

### Calendar（c++20)

* 日期类，用来对日期时间进行比较。

```cpp
  using namespace std::chrono_literals;
  //使用字面量 ""y ""d(C++20) 
  auto ymd1 = 2023y / std::chrono::November / 10d; // 2023-11-10
  auto ymd2 = 2023y / std::chrono::September / 10d; // 2023-9-10
  if(ymd1 > ymd2) {
 // ymd1 > ymd2
    std::cout << "ymd1 > ymd2" << std::endl;
  }
```

## 常见用法

### 获取当前系统时间戳

```cpp
  //获取系统时间戳,实例化系统时钟
  std::chrono::system_clock clock;
  std::chrono::system_clock::time_point now = clock.now();
  std::chrono::_V2::system_clock::duration d = now.time_since_epoch();
  //纳秒单位时间戳
  std::cout << "timestamp: " << d.count() << std::endl;
  //转化为秒单位
  std::chrono::seconds t = std::chrono::duration_cast<std::chrono::seconds>(d);
  std::cout << "sec: " << t.count() << std::endl;
 
 
//简化写法
//  std::chrono::system_clock clock;
//  auto t = std::chrono::duration_cast<std::chrono::seconds>(
//  			clock.now().time_since_epoch()).count();
//  std::cout << "sec: " << t << std::endl;
```

### 计算时间间隔

```cpp
  const auto start = std::chrono::high_resolution_clock::now();
  //do something
  std::this_thread::sleep_for(std::chrono::seconds(1));
  const auto end = std::chrono::high_resolution_clock::now();

  auto duration = start - end;
  //1000118000ns 1000ms 1s 
  std::cout << duration.count() << "ns " << 
    std::chrono::duration_cast<std::chrono::milliseconds>(duration).count()<<  "ms " <<
    std::chrono::duration_cast<std::chrono::seconds>(duration).count() << "s " <<
    std::endl;
```

### 格式化输出

```cpp
  auto now = std::chrono::system_clock::now();
  std::time_t now_c = std::chrono::system_clock::to_time_t(now);
  //cur time Thu Nov  9 23:42:38 2023
  std::cout << "cur time " << std::ctime(&now_c) << std::endl;
  //或者转化为当地时间
  //自定义格式输出
  tm * t = std::localtime(&now_c);
	char buffer[80];
	std::strftime(buffer, 80, "%Y-%m-%d %H:%M:%S", t);
   //cur time: 2023-11-09 23:42:38
  std::cout << "cur time: " << buffer << std::endl;
```

### 字符串转化为时间戳

```cpp
time_t GetUnixSecFromStr(const std::string &raw_time) {
	std::istringstream ss(raw_time);
	std::tm tm{};

	ss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S"); //ex:2023-12-22 19:22:23
	return std::mktime(&tm);
}
```

### 时间戳转为time_point类型

```cpp
time_t time;
auto t_point = std::chrono::system_clock::from_time_t(time);
```

### 字面量使用

```cpp
  //使用字面量 c++20 ""y ""d  c++11 支持 ""h ""min ""s ""ms ""us
  using namespace std::chrono_literals;//在此空间定义字面量
  auto s = 60s; // 相当于std::chrno::seconds(60)
  std::cout << "sec: " << s.count() << std::endl;
  auto min = 1min; // 相当于std::chrono::minutes(1):
  std::cout << "min: " << min.count() << std::endl;
```

## 实现一个计时器
