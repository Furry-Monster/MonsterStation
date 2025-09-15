---
title: C++智能指针:原理、应用和陷阱
published: 2025-09-07
description: 现代C++之智能指针
image: ./cover.png
tags: [Cpp,语言]
category: 现代C++
draft: false
lang: ''
---
## **1. 对象生命周期**

### **1.1 程序对象的生存期**

* 全局对象在程序启动时分配，在程序结束时销毁。
* 对于局部自动对象，当我们进入其定义所在的程序块时被创建，在离开块时销毁。
* 局部static对象在第一次使用前分配，在程序结束时销毁。
* C++还支持动态分配对象。**动态分配的对象的生存期与它们在哪里创建是无关的，只有当显式地被释放时，这些对象才会销毁。**

### **1.2 动态内存管理**

在C++中，动态内存的管理是通过一对运算符来完成的：new，在动态内存中为对象分配空间并返回一个指向该对象的指针，我们可以选择对对象进行初始化；delete，接受一个动态对象的指针，销毁该对象，并释放与之关联的内存。

但是当你面对大量的指针变量的时候，如果程序因为异常而跳过了某些步骤，指针可能不会被释放，但是由于进程仍然在运作，那么我们就永久地（至少在进程释放前）失去了这块内存的使用权...

### 1.3 所有权

C++ 的所有权是动态内存管理部分的一个核心概念，它定义了哪个对象或代码段负责管理特定资源的生命周期，特别是内存。正确理解和管理所有权是编写安全、高效且无内存泄漏的 C++ 代码的关键。

可能所有权这个名词，更多地是在Rust中听到，但其实所谓的所有权，就是指某个指针受谁管理，以及它创建和释放的时机应该隶属于谁来管理。

C++中所有权的基本模型遵循**RAII(Resource Acquisition Is Initialization)**原则。

RAII 的核心思想是：

1. **资源获取即初始化:** 在构造函数中获取资源（如分配内存）。
2. **资源释放即析构:** 在析构函数中释放资源（如释放内存）。

RAII 利用了 C++ 对象生命周期的确定性，确保无论代码如何执行（例如，由于异常抛出），资源最终都会被释放。

# **2. RAII的应用——三种智能指针**

为了更容易，同时也更安全地使用动态内存，基于RAII的思想，新的标准库提供了 `std::unique_ptr`和 `std::shared_ptr`类型来管理动态对象。智能指针的行为类似常规指针， **重要的区别是它负责自动释放所指向的对象** 。

## **2.1 `std::shared_ptr`类**

### **2.1.1 `std::shared_ptr<T>`是什么**

`std::shared_ptr<T>`是一个类模板，它的对象行为像指针，但是它还能记录有多少个对象共享它管理的内存对象。多个 `std::shared_ptr<T>`可以共享同一个对象。当最后一个 `std::shared_ptr<T>`被销毁时，它会自动释放它所指向的对象。一个 `shared_ptr<T>`指针可以通过 `make_shared<T>`函数来创建，也可以通过拷贝或赋值另一个 `shared_ptr`来创建。如图所示，sp1和sp2指向同一个对象，内存对象的引用计数为2。当sp1被销毁时，引用计数减为1，sp2仍然指向该对象。当sp2被销毁时，引用计数减为0，内存对象被销毁。

![img](1.png)

### **2.1.2 `std::shared_ptr`的底层原理：**

```cpp
element_type*    _M_ptr;         // Contained pointer.
__shared_count<_Lp>  _M_refcount;    // Reference counter.
```

![img](2.png)

`std::shared_ptr`在内部维护一个引用计数，其只有两个指针成员，一个指针是所管理的数据的地址；还有一个指针是控制块的地址，包括引用计数、weak_ptr计数、删除器(Deleter)、分配器(Allocator)。因为不同shared_ptr指针需要共享相同的内存对象，因此 **引用计数的存储是在堆上的** 。而unique_ptr只有一个指针成员，指向所管理的数据的地址。因此一个shared_ptr对象的大小是raw_pointer大小的两倍。

```cpp
// 32位编译器下
std::cout<<sizeof(std::shared_ptr<int>)<<std::endl; // 8
std::cout<<sizeof(std::unique_ptr<int>)<<std::endl; // 4
```

### **2.1.3 `std::shared_ptr<T>`的简单实现**

我们通过下面这个简单的类来模拟 `std::shared_ptr<T>`的实现，来理解引用计数的实现原理。这里我们为了简单，只实现了 `shared_ptr`的拷贝构造函数、析构函数和赋值运算符函数，引用计数只是简单地用了一个 `int`类型的内存空间，省略了 `weak_ptr`的计数、删除器和分配器，不考虑多线程的情况。

* 当我们销毁一个 `shared_ptr`时，引用计数减1。当引用计数减为0时，我们删除指向实际数据的指针和指向引用计数的指针。
* 当我们拷贝一个 `shared_ptr`时，引用计数加1。
* 当我们赋值一个 `shared_ptr`时，我们首先递减左侧运算对象的引用计数。如果引用计数变为0，我们就释放左侧运算对象分配的内存以及引用计数的内存。然后拷贝右侧运算对象的数据指针和引用计数指针，最后递增引用计数。

```cpp
template<typename T>
class shared_ptr {
public:
// constructor
shared_ptr(T* ptr = nullptr) : m_ptr(ptr), m_refCount(new int(1)) {}

// copy constructor
shared_ptr(const shared_ptr& other) : m_ptr(other.m_ptr), m_refCount(other.m_refCount) {
    // increase the reference count
    (*m_refCount)++;
}

// destructor
~shared_ptr() {
    // decrease the reference count
    (*m_refCount)--;
    // if the reference count is zero, delete the pointer
    if (*m_refCount == 0) {
        delete m_ptr;
        delete m_refCount;
    }
}

// overload operator=()
shared_ptr& operator=(const shared_ptr& other) {
    // check self-assignment
    if (this != &other) {
        // decrease the reference count for the old pointer
        (*m_refCount)--;
        // if the reference count is zero, delete the pointer
        if (*m_refCount == 0) {
            delete m_ptr;
            delete m_refCount;
        }
        // copy the data and reference pointer and increase the reference count
        m_ptr = other.m_ptr;
        m_refCount = other.m_refCount;
        // increase the reference count
        (*m_refCount)++;
    }
    return *this;
}

private:
    T* m_ptr;            // points to the actual data
    int* m_refCount;     // reference count
};
```

### **2.1.4 `std::shared_ptr<T>`的内置方法**

| 方法                     | 用途                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| make_shared`<T>`(args) | 返回一个shared_ptr，指向一个动态分配的类型为T的对象，使用args初始化此对象。 |
| shared_ptr`<T>`p(q)    | p是q的拷贝，此操作递增q中的计数器。q中的指针必须能转换为T*。                |
| shared_ptr`<T>`p = q   | p是q的拷贝，此操作递增q中的计数器。q中的指针必须能转换为T*。                |
| p.unique()               | 如果p.use_count()为1，返回true，否则返回false。                             |
| p.use_count()            | 返回与p共享对象的智能指针数量。                                             |

### **2.1.4 什么时候用 `std::shared_ptr<T>`？**

通常用于一些资源创建昂贵比较耗时的场景， 比如涉及到文件读写、网络连接、数据库连接等。当需要共享资源的所有权时，例如，一个资源需要被多个对象共享，但是不知道哪个对象会最后释放它，这时候就可以使用 `std::shared_ptr<T>`。

## **2.2 `std::unique_ptr`类**

unique_ptr“独占”所指向的对象。

### **2.2.1 `std::unique_ptr<T>`的原理和使用**

* `std::unique_ptr`独占性的实现

其不能拷贝和赋值，对应拷贝构造函数和赋值运算符函数已定义删除。

```cpp
// Disable copy from lvalue.
unique_ptr(const unique_ptr&) = delete;
unique_ptr& operator=(const unique_ptr&) = delete;

```

* C++14通过 `std::make_unique`创建unique_ptr，是一种更加异常安全的做法。
* 释放所有权 `sp.release()`, 返回raw pointer

```cpp
unique_ptr<int> p1 = make_unique<int>(1);
int* a = p1.release();
std::cout<<*a<<std::endl;
delete a; // you need to delete it manually
```

* 重置所有权 `sp.reset()`, 释放所有权，指向空指针

```cpp
unique_ptr<int> p1 = make_unique<int>(1);
p1.reset();
std::cout<<p1.get()<<std::endl; // 0
```

### **2.2.2 `std::shared_ptr` 和 `std::unique_ptr`共有操作**

| 方法              | 用途                                     |
| ----------------- | ---------------------------------------- |
| p.get()           | 返回p中保存的指针，不会影响p的引用计数。 |
| p.reset()         | 释放p指向的对象，将p置为空。             |
| p.reset(q)        | 释放p指向的对象，令p指向q。              |
| p.reset(new T)    | 释放p指向的对象，令p指向一个新的对象。   |
| p.swap(q)         | 交换p和q中的指针。                       |
| swap(p, q)        | 交换p和q中的指针。                       |
| p.operator*()     | 解引用p。                                |
| p.operator->()    | 成员访问运算符，等价于(*p).member。      |
| p.operator bool() | 检查p是否为空指针。                      |

程序示例：

```cpp
std::unique_ptr<int> p1 = std::make_unique<int>(42);
std::unique_ptr<int> p2 = std::make_unique<int>(44);
int* p = p1.get();
std::cout<<*p<<std::endl; // 42
p1.swap(p2);
std::cout<<*p1<<std::endl; // 44
std::cout<<*p2<<std::endl; // 42
p1.reset();
std::cout<<p1.get()<<std::endl; // 0, first call get(), then call operator bool()

```

### **2.2.4 如何转移控制权？**

`std::move()` 可以将一个 `unique_ptr`转移给另一个 `unique_ptr`或者 `shared_ptr`。转移后，原来的 `unique_ptr`将不再拥有对内存的控制权，将变为空指针。

```cpp
std::unique_ptr<int> p1 = std::make_unique<int>(0);
std::unique_ptr<int> p2 = std::move(p1); 
// now, p1 is nullptr
```

### **2.2.5 什么时候用 `std::unique_ptr<T>`？**

`std::unique_ptr<T>`比 `std::shared_ptr<T>`具有更小的内存，而且不需要维护引用计数，因此它的性能更好。当我们需要一个独占的指针时，应该优先使用 `std::unique_ptr<T>`。

## **2.3 `std::weak_ptr`类**

标准库还定义了一个名为 `weak_ptr`的伴随类，它是一种弱引用， **指向shared_ptr所管理的对象** ，而不影响所指对象的生命周期，也就是将一个 `weak_ptr`绑定到一个 `shared_ptr`不会改变 `shared_ptr`的引用计数。不论是否有 `weak_ptr`指向，一旦最后一个指向对象的 `shared_ptr`被销毁，对象就会被释放。

### **2.3.1 如何读取引用对象?**

`weak_ptr`对它所指向的 `shared_ptr`所管理的对象没有所有权，不能对它解引用，因此若要读取引用对象，必须要转换成 `shared_ptr`。 C++中提供了lock函数来实现该功能。如果对象存在，`lock()`函数返回一个指向共享对象的 `shared_ptr`，否则返回一个空 `shared_ptr`。

### **2.3.2 如何判断 `weak_ptr`指向对象是否存在呢？**

`weak_ptr`提供了一个成员函数 `expired()`来判断所指对象是否已经被释放。如果所指对象已经被释放，expired()返回true，否则返回false。

程序示例：

```cpp
std::shared_ptr<int> sp1(new int(22));
std::shared_ptr<int> sp2 = sp1;
std::weak_ptr<int> wp = sp1; // point to sp1
std::cout<<wp.use_count()<<std::endl; // 2
if(!wp.expired()){
    std::shared_ptr<int> sp3 = wp.lock();
    std::cout<<*sp3<<std::endl; // 22
}
```

### **2.3.3 `std::weak_ptr`也可以作为 `std::shared_ptr`的构造函数参数**

`std::weak_ptr`可以作为 `std::shared_ptr`的构造函数参数，但如果 `std::weak_ptr`指向的对象已经被释放，那么 `std::shared_ptr`的构造函数会抛出 `std::bad_weak_ptr`异常。

```text
std::shared_ptr<int> sp1(new int(22));
std::weak_ptr<int> wp = sp1; // point to sp1
std::shared_ptr<int> sp2(wp);
std::cout<<sp2.use_count()<<std::endl; // 2
sp1.reset();
std::shared_ptr<int> sp3(wp); // throw std::bad_weak_ptr
```

### **2.3.4 `std::weak_ptr` 一些内置方法**

| 方法           | 用途                                                             |
| -------------- | ---------------------------------------------------------------- |
| use_count()    | 返回与之共享对象的shared_ptr的数量                               |
| expired()      | 检查所指对象是否已经被释放                                       |
| lock()         | 返回一个指向共享对象的shared_ptr，若对象不存在则返回空shared_ptr |
| owner_before() | 提供所有者基于的弱指针的排序                                     |
| reset()        | 释放所指对象                                                     |
| swap()         | 交换两个weak_ptr对象                                             |

### **2.3.5 `std::weak_ptr`的使用场景**

#### **2.3.5.1 用于实现缓存**

weak_ptr可以用来缓存对象，当对象被销毁时，weak_ptr也会自动失效，不会造成野指针。

假设我们有一个Widget类，我们需要从文件中加载Widget对象，但是Widget对象的加载是比较耗时的。

```cpp
std::shared_ptr<Widget> loadWidgetFromFile(int id); 
// a factory function which returns a shared_ptr, which is expensive to call
// may perform file or database I/O
```

因此，我们希望Widget对象可以缓存起来，当下次需要Widget对象时，可以直接从缓存中获取，而不需要重新加载。这个时候，我们就可以使用 `std::weak_ptr`来缓存Widget对象，实现快速访问。如以下代码所示：

```cpp
std::shared_ptr<Widget> fastLoadWidget(int id) {
    static std::unordered_map<int, std::weak_ptr<Widget>> cache;
    auto objPtr = cache[id].lock(); 
    if (!objPtr) {
        objPtr = loadWidgetFromFile(id);
        cache[id] = objPtr; // use std::shared_ptr to construct std::weak_ptr
    }
    return objPtr;
}
```

当对应id的Widget对象已经被缓存时，`cache[id].lock()`会返回一个指向Widget对象的 `std::shared_ptr`，否则 `cache[id].lock()`会返回一个空的 `std::shared_ptr`，此时，我们就需要重新加载Widget对象，并将其缓存起来，这一步会由 `std::shared_ptr`构造 `std::weak_ptr`。

为什么不直接存储 `std::shared_ptr`呢？因为这样会导致缓存中的对象永远不会被销毁，因为 `std::shared_ptr`的引用计数永远不会为0。而 `std::weak_ptr`不会增加对象的引用计数，因此，当缓存中的对象没有被其他地方引用时，`std::weak_ptr`会自动失效，从而导致缓存中的对象被销毁。

#### **2.3.5.2 避免循环引用**

* 什么是循环引用问题 ？

循环引用是指两个或多个对象之间通过 `shared_ptr`相互引用，形成了一个环，导致它们的引用计数都不为0，从而导致内存泄漏。

在观察者模式中使用shared_ptr可能会出现循环引用，在下面的程序中，Observer对象和Subject对象相互引用，导致它们的引用计数都不为0，从而导致内存泄漏。

![img](3.png)

```cpp
class IObserver {
public:
    virtual void update(const string& msg) = 0;
};

class Subject {
public:
    void attach(const std::shared_ptr<IObserver>& observer) {
        observers_.emplace_back(observer);
    }
    void detach(const std::shared_ptr<IObserver>& observer) {
        observers_.erase(std::remove(observers_.begin(), observers_.end(), observer), observers_.end());
    }
    void notify(const string& msg) {
        for (auto& observer : observers_) {
            observer->update(msg);
        }
    }
private:
    std::vector<std::shared_ptr<IObserver>> observers_;
};

class ConcreteObserver : public IObserver {
public:
    ConcreteObserver(const std::shared_ptr<Subject>& subject) : subject_(subject) {}
    void update(const string& msg) override {
        std::cout << "ConcreteObserver " << msg<< std::endl;
    }
private:
    std::shared_ptr<Subject> subject_;
};

int main() {
    std::shared_ptr<Subject> subject = std::make_shared<Subject>();
    std::shared_ptr<IObserver> observer = std::make_shared<ConcreteObserver>(subject);
    subject->attach(observer);
    subject->notify("update");
    return 0;
}
```

* 避免循环引用的方法

将Observer类中的subject_成员变量改为 `weak_ptr`，这样就打破循环引用，不会导致内存无法正确释放了。

#### **2.3.5.3 用于实现单例模式**

单例模式是指一个类只能有一个实例，且该类能自行创建这个实例的一种模式。单例模式的实现方式有很多种，其中一种就是使用 `std::weak_ptr`。

```cpp
class Singleton {
public:
    static std::shared_ptr<Singleton> getInstance() {
        std::shared_ptr<Singleton> instance = m_instance.lock();
        if (!instance) {
            instance.reset(new Singleton());
            m_instance = instance;
        }
        return instance;
    }
private:
    Singleton() {}
    static std::weak_ptr<Singleton> m_instance;
};

std::weak_ptr<Singleton> Singleton::m_instance;
```

用 `std::weak_ptr`实现单例模式的优点：

1. 避免循环应用：避免了内存泄漏。
2. 访问控制：可以访问对象，但是不会延长对象的生命周期。
3. 可以在单例对象不被使用时，自动释放对象。

## **3. 关于智能指针的更多问题**

### **3.1 尽量使用 `std::make_shared<T>`而不是 `shared_ptr<T>(new T)`**

`std::make_shared<T>`是更异常安全的做法。`std::make_shared<T>`是一个函数模板，它在动态内存中分配一个对象并初始化它，返回指向此对象的 `std::shared_ptr<T>`。`std::make_shared<T>`的好处是它只进行一次内存分配，而 `std::shared_ptr<T>(new T)`则进行两次内存分配，一次是为T分配内存，另一次是为 `std::shared_ptr<T>`的控制块分配内存。因此，`std::make_shared<T>`是更好的选择。

例如：

```cpp
std::shared_ptr<int> sp(new int(42)); // exception unsafe
```

当new int(42)抛出异常时，sp将不会被创建，从而对应new分配的内存也不会释放，从而导致内存泄漏。

### **3.2 智能指针SmartPointer与裸指针RawPointer的性能对比[3][4]**

* shared_ptr由于占据更多内存，且需要通过原子操作维护引用计数，因此效率是比较慢的。在不开启编译器优化的时候，是比new操作慢10倍，此时不应该使用make_shared、shared_ptr。开启优化后，也大概慢2-3倍。
* unique_ptr、make_unique、带少许偏差的make_shared几乎和new、delete具有一样的性能。
* unique_ptr自动管理内存资源，而几乎没有额外开销。因此效率和new、delete几乎一样。

### **3.3 `shared_ptr`的线程安全问题**

如果多个线程同时拷贝同一个 shared_ptr 对象，不会有问题，因为 shared_ptr 的引用计数是线程安全的。但是如果多个线程同时修改同一个 shared_ptr 对象，不是线程安全的。因此，如果多个线程同时访问同一个 shared_ptr 对象，并且有写操作，需要使用互斥量来保护。

* 引用计数更新，线程安全

这里我们讨论对shared_ptr进行拷贝的情况，由于此操作读写的是引用计数，而引用计数的更新是原子操作，因此这种情况是线程安全的。下面这个例子，两个线程同时对同一个shared_ptr进行拷贝，引用计数的值总是20001。

```cpp
std::shared_ptr<int> p = std::make_shared<int>(0);
constexpr int N = 10000;
std::vector<std::shared_ptr<int>> sp_arr1(N);
std::vector<std::shared_ptr<int>> sp_arr2(N);

void increment_count(std::vector<std::shared_ptr<int>>& sp_arr) {
    for (int i = 0; i < N; i++) {
        sp_arr[i] = p;
    }
}

std::thread t1(increment_count, std::ref(sp_arr1));
std::thread t2(increment_count, std::ref(sp_arr2));
t1.join();
t2.join();
std::cout<< p.use_count() << std::endl; // always 20001
```

* 同时修改内存区域，线程不安全

下面这个例子，两个线程同时对同一个shared_ptr指向内存的值进行自增操作，最终的结果不是我们期望的20000。因此同时修改shared_ptr指向的内存区域不是线程安全的。

```cpp
std::shared_ptr<int> p = std::make_shared<int>(0);
void modify_memory() {
    for (int i = 0; i < 10000; i++) {
        (*p)++;
    }
}

std::thread t1(modify_memory);
std::thread t2(modify_memory);
t1.join();
t2.join();
std::cout << "Final value of p: " << *p << std::endl; // possible result: 16171, not 20000

```

* 直接修改shared_ptr对象本身的指向，线程不安全。下面这个程序示例，两个线程同时修改同一个shared_ptr对象的指向，程序发生了异常终止。

```cpp
std::shared_ptr<int> sp = std::make_shared<int>(1);
auto modify_sp_self = [&sp]() {
    for (int i = 0; i < 1000000; ++i) {
        sp = std::make_shared<int>(i);
    }
};

std::vector<std::thread> threads;
for (int i = 0; i < 10; ++i) {
    threads.emplace_back(modify_sp_self);
}
for (auto& t : threads) {
    t.join();
}

```

报错为：

```text
pure virtual method called
terminate called without an active exception
```

用gdb查看函数调用栈，发现是在调用 `std::shared_ptr<int>::~shared_ptr()`时出错，

```text
(gdb) bt
#0  __GI_raise (sig=sig@entry=6) at ../sysdeps/unix/sysv/linux/raise.c:50
#1  0x00007ffff7bc7859 in __GI_abort () at abort.c:79
#2  0x00007ffff7e73911 in ?? () from /lib/x86_64-linux-gnu/libstdc++.so.6
#3  0x00007ffff7e7f38c in ?? () from /lib/x86_64-linux-gnu/libstdc++.so.6
#4  0x00007ffff7e7f3f7 in std::terminate() () from /lib/x86_64-linux-gnu/libstdc++.so.6
#5  0x00007ffff7e80155 in __cxa_pure_virtual () from /lib/x86_64-linux-gnu/libstdc++.so.6
#6  0x00005555555576c2 in std::_Sp_counted_base<(__gnu_cxx::_Lock_policy)2>::_M_release() ()
#7  0x00005555555572fd in std::__shared_count<(__gnu_cxx::_Lock_policy)2>::~__shared_count() ()
#8  0x0000555555557136 in std::__shared_ptr<int, (__gnu_cxx::_Lock_policy)2>::~__shared_ptr() ()
#9  0x000055555555781c in std::__shared_ptr<int, (__gnu_cxx::_Lock_policy)2>::operator=(std::__shared_ptr<int, (__gnu_cxx::_Lock_policy)2>&&) ()
#10 0x00005555555573d0 in std::shared_ptr<int>::operator=(std::shared_ptr<int>&&) ()
#11 0x000055555555639f in main::{lambda()#1}::operator()() const ()
... 
```

其原因为：在并发修改的情况下，对正在析构的对象再次调用析构函数，导致了此异常。

对程序加锁后，程序可正常运行:

```cpp
std::shared_ptr<int> sp = std::make_shared<int>(1);
std::mutex m;
auto modify = [&sp]() {
    // make the program thread safe
    std::lock_guard<std::mutex> lock(m);
    for (int i = 0; i < 1000000; ++i) {
        sp = std::make_shared<int>(i);
    }
};

std::vector<std::thread> threads;
for (int i = 0; i < 10; ++i) {
    threads.emplace_back(modify);
}
for (auto& t : threads) {
    t.join();
}
std::cout << *sp << std::endl;  // running as expected, result: 999999
```

### **3.4 自定义删除器 `Custom Deleter`**

### **3.4.1 自定义删除器的使用场景**

自定义删除器的作用是在智能指针释放所管理的对象时，执行一些特殊的操作，比如：

* 内存释放时打印一些日志。
* 管理除内存以外的其它资源，例如文件句柄、数据库连接等。
* 与自定义分配器（Allocator）配合使用，将资源释放给自定义分配器。

### **3.4.2 自定义删除器的使用**

自定义删除器可以是一个函数，也可以是一个类的对象, 也可以是一个lambda表达式。

如果是一个函数，它的形式如下：

```cpp
void free_memory(int* p) {
    std::cout << "delete memory" << std::endl;
    delete p;
}
```

如果是一个类的对象，它的形式如下：

```cpp
class FreeMemory {
public:
    void operator()(int* p) {
        std::cout << "delete memory" << std::endl;
        delete p;
    }
};
```

如果是一个lambda表达式，它的形式如下：

```cpp
auto free_memory_lambda = [](int* p) {
    std::cout << "delete memory" << std::endl;
    delete p;
}
```

* shared_ptr自定义删除器的使用:
  对于shared_ptr, 不管删除器什么类型，是否有状态都不会增加shared_ptr的大小, 均为两个字长。因为删除器是存储在控制块中，而控制块的大小为两个字长。

```cpp
std::shared_ptr<int> sp1(new int(0), free_memory); // size: 8
std::shared_ptr<int> sp2(new int(0), FreeMemory()); // size: 8
std::shared_ptr<int> sp3(new int(0), free_memory_lambda); // size: 8
```

* unique_ptr自定义删除器的使用:
  * unique_ptr的删除器类型是一个模板参数，因此需要指定删除器类型。
  * 如果删除器是函数指针类型，`std::unique_ptr`大小从1个字长增长到2个字长，因为需要存储函数指针。
  * 如果删除器是无状态删除器（stateless function），比如不进行捕获的lambda表达式，`std::unique_ptr`大小不变，因为无状态删除器不需要存储任何成员变量。

```cpp
std::unique_ptr<int, FreeMemory> up1(new int(0)); // size: 4
std::unique_ptr<int, void(*)(int*)> up2(new int(0), free_memory);  // size: 8
std::unique_ptr<int, decltype(free_memory)*> up3(new int(0), free_memory); // size: 4
```

### **3.4.3 有状态删除器和无状态删除器**

什么是有状态删除器？什么是无状态删除器？有状态删除器是指删除器类中包含有成员变量，无状态删除器是指删除器类中不包含有成员变量。

如果 `std::unique_ptr`的函数对象删除器是具有扩展状态的，其大小可能会非常大。如果大得无法接受，可能需要设计一个无状态删除器。

下面是一个有状态删除器的例子：

```cpp
class DeleteObject {
public:
    DeleteObject(int n) : n_(n) {}
    void operator()(int* p) {
        std::cout << "delete memory " << n_ << std::endl;
        delete p;
    }
private:
    int n_;
};
```

### **3.5 避免用同一个 `raw pointer`初始化多个 `shared_ptr`**

### **3.5.1 为什么不要用同一个 `raw pointer`初始化多个 `shared_ptr`？**

因为多个 `shared_ptr`由同一个 `raw pointer`创建时会导致生成两个独立的引用计数控制块，从以下程序可见sp1、sp2的引用计数都为1。

```cpp
int* p = new int(0);
std::shared_ptr<int> sp1(p);
std::shared_ptr<int> sp2(p);
std::cout<<sp1.use_count()<<std::endl; // 1
std::cout<<sp2.use_count()<<std::endl; // 1
```

当sp1、sp2销毁时会产生未定义行为，因为 `shared_ptr`的析构函数会释放它所管理的对象，当 `sp1`析构时，会释放 `p`指向的内存，当 `sp2`析构时，会再次释放 `p`指向的内存。

### **3.5.2 `enable_shared_from_this`模板类**

* 作用：用于在类对象的内部中获得一个指向当前对象的 shared_ptr 对象
* 解决问题： 如果通过this指针创建shared_ptr时，相当于通过一个裸指针创建shared_ptr，多次创建会导致多个shared_ptr对象管理同一个内存。当shared_ptr对象销毁时，会释放this指向的内存，但是this指针可能还会被使用，导致程序崩溃。

```cpp
class A {
public:
    std::shared_ptr<A> get_shared_ptr() {
        return std::shared_ptr<A>(this); // error
    }
};

```

* 使用方法： 继承enable_shared_from_this类；通过shared_from_this()方法返回。

```cpp
class A : public std::enable_shared_from_this<A> {
public:
    std::shared_ptr<A> get_shared_ptr() {
        return shared_from_this();
    }
};
```

* 原理：在类中维护一个weak_ptr，将weak_ptr作为参数传入shared_ptr的构造函数，返回一个shared_ptr对象。 [8]

```cpp
template<typename _Tp>
class enable_shared_from_this
{
protected:
    constexpr enable_shared_from_this() noexcept = default;
    enable_shared_from_this(const enable_shared_from_this&) noexcept = default;
    enable_shared_from_this& operator=(const enable_shared_from_this&) noexcept = default;
    ~enable_shared_from_this() = default;
public:
    shared_ptr<_Tp> shared_from_this()
    {
        shared_ptr<_Tp> __p(_M_weak_this);
        return __p;
    }

    shared_ptr<const _Tp> shared_from_this() const
    {
        shared_ptr<const _Tp> __p(_M_weak_this);
        return __p;
    }

    weak_ptr<_Tp> weak_from_this() noexcept // C++17
    {
        return _M_weak_this;
    }

    weak_ptr<const _Tp> weak_from_this() const noexcept // C++17
    {
        return _M_weak_this;
    }

    template<typename _Up> friend class shared_ptr;
};
```

* 限制：只能用于继承自enable_shared_from_this的类。
* 适用场景：在类的内部需要获得一个指向当前对象的shared_ptr对象时，可以使用enable_shared_from_this模板类。

### **3.6 智能指针模板中的类型可以是数组吗?**

`std::shared_ptr`和 `std::unique_ptr`都可以指向数组。在C++17后，`std::shared_ptr`也提供了 `operator[]`操作符，可以像访问数组一样访问 `std::shared_ptr`指向的数组。 [5] 而在C++17之前是不支持的。

```cpp
std::shared_ptr<int[]> sp1(new int[10]);
std::unique_ptr<int[]> up1(new int[10]);
for (int i = 0; i < 10; i++) {
    sp1[i] = i;
    up1[i] = i;
}
```

数组类型的 `std::shared_ptr`和 `std::unique_ptr`是一种知识性的兴趣，因为C++中有更好的容器类型 `std::vector`、`std::array`和 `std::string`来替代原始数组。[2]
