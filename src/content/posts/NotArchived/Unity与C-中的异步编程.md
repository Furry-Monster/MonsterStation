---
title: Unity与C#中的异步编程
published: 2025-01-29
image: ./unity.png
description:  我再也不和大佬玩抽象了
tags: [Unity,游戏开发,CSharp]
category: Unity笔记
draft: false
---
参考文章：

[https://wudaijun.com/2021/11/c-sharp-unity-async-programing/](https://wudaijun.com/2021/11/c-sharp-unity-async-programing/)

[https://hamidmosalla.com/2018/06/24/what-is-synchronizationcontext/](https://hamidmosalla.com/2018/06/24/what-is-synchronizationcontext/)

## Motivation

最近写框架的时候，在场景加载的时候偶然发现

```csharp
await SceneManager.LoadSceneAsync(_sceneEnum.ToString());
```

会报错,必须用一个Task包裹起来才能异步加载场景。

```csharp
private Task LoadSceneAsync(string sceneName)
{
    var tcs = new TaskCompletionSource<object>();
    var asyncOperation = SceneManager.LoadSceneAsync(sceneName);
    asyncOperation.completed += _ => tcs.SetResult(null);
    return tcs.Task;
}
```

于是斗胆请教群里大佬，给出的结论是把Task换成UniTask就行，然后反手甩给我一篇文章，所以这篇博客就到这里结束了（bushi）

好吧，回到正题，Unity协程这方面确实欠缺一些经验，何况Unity的协程是用一种比较特殊的形式实现的，所以有必要稍微总结一下。

在网上找到了一篇不错的文章，内容很全，但是教学语言比较晦涩难懂，所有就用自己的话来记录一遍了喵。

Unity的协程是通过C#枚举器实现的，那这里就不得不先提一下**yield语句**了

## C# yield语句

先来看这段代码：

```csharp
public static IEnumerable<int> TestYield(int a)
{
    yield return a+1;
    if (a % 2 == 0) {
        yield break;
    }
    else {
        yield return 1;
    }
    yield return 2;
}
static void Main(string[] args)
{
    IEnumerator<int> enumerator = TestYield(4).GetEnumerator();
    while (enumerator.MoveNext())
    {
        Console.WriteLine(enumerator.Current);
    }
}
// Output:
// 5
```

程序执行流程:
当你运行程序时，传递给 TestYield 的值为 4（偶数）：

1. 首先，yield return a + 1 返回 4 + 1 = 5，并暂停方法执行。
2. 然后，程序判断 a % 2 == 0，由于 4 是偶数，执行 yield break;，终止迭代器的执行。
3. 由于调用 yield break 后方法已停止，之后的 yield return 1; 和 yield return 2; 不会被执行。
   因此，程序会输出：5。

不难看出，yield 语句的作用就是暂停函数执行，并返回一个值，这个值可以被迭代器使用。所以一般用yield来做迭代器，可以这样

## Unity Coroutine（协程）

原文这句话比较难懂，我们总结一下它的要点：

### 1. 协程的基本概念

- 协程 是一种特殊的编程方式，它允许你暂停某个方法的执行，过一段时间后再继续执行。这对于需要延时操作或者异步处理的场景很有用。
- 在Unity中，协程通过 StartCoroutine() 启动，Unity会管理协程的执行，不需要开发者手动控制。

### 2. 如何使用Unity的协程

- 在Unity中，协程通常使用 yield return 来暂停执行。例如，你可以使用 yield return new WaitForSeconds(1f); 来暂停协程1秒钟。
- Unity的协程是基于 枚举器（IEnumerator） 实现的，Unity会自动管理枚举器的迭代，直到协程完成。

### 3. YieldInstruction

- yield return 后面的对象必须是 YieldInstruction 类的实例（比如 WaitForSeconds 或 WaitForEndOfFrame）。这些对象告诉Unity如何等待，直到操作完成。
- Unity会不断检查这些对象的状态，一旦它们完成，协程会继续执行。

### 4. Unity协程和JavaScript Generator的对比

- JavaScript的Generator 和 C#的yield 很像，都是通过暂停和恢复函数来控制异步操作。
- Unity的协程使用 yield 进行类似的操作，但它没有JavaScript那样的双向数据传递能力。也就是说，C#的 yield 只能将数据传递给协程，而不能从协程中返回数据。

### 5. 协程的生命周期管理

- 在Unity中，协程与 GameObject 绑定。如果一个物体被销毁，相关的协程也会停止。
- Unity还支持嵌套协程，即一个协程可以等待另一个协程完成后再继续执行。

### 6. 总结

- Unity的协程实际上是基于C#的 yield 语法，通过使用一些特殊的 YieldInstruction 类来控制异步操作。
  它提供了一种比传统异步编程更简单的方式来处理延时、定时操作或帧控制。
- 尽管Unity协程能做很多事情，但它的灵活性和功能不如JavaScript的Generator或其他一些语言中的协程（比如Golang）。

总体来说，Unity的协程是非常方便的异步工具，但它并不完全等同于其他语言中的协程。

## C# Task

Task是.NET Framework 4.0引入的新概念，它是一种轻量级的线程，可以用来代表一个异步操作的结果。

原文提供了这段代码:

```csharp
static void Main(string[] args) {
    int a = 888;
    int b = 111;
    var task = new Task<int>(() =>
    {
        Console.WriteLine("add task, on thread{0}", Thread.CurrentThread.ManagedThreadId);
        return a + b;
    });
    Console.WriteLine("main thread{0}, task{1} init status: {2}", Thread.CurrentThread.ManagedThreadId, task.Id, task.Status);
    task.Start();
    task.ContinueWith((task, arg) =>
    {
        Console.WriteLine("continue with 1, got result: {0}, got arg: {1}, on thread{2}", task.Result, arg, Thread.CurrentThread.ManagedThreadId);
    }, "Arg1").
    ContinueWith((task) =>
    {
        Console.WriteLine("continue with 2, on thread{0}", Thread.CurrentThread.ManagedThreadId);
    }).Wait();
}

// Output:
// main thread1, task1 init status: Created
// add task, on thread3
// continue with 1, got result: 999, got arg: Arg1, on thread4
// continue with 2, on thread5
```

这段代码我觉得比较好理解，体现了Task的几个特点：

1. 任务内部有个简单的状态机，其他线程可通过Task.Status获取任务当前状态
2. Task.ContinueWith返回值是一个新的Task，可以像JS promise.then一样，以可读性较好的方式(相比回调地狱)书写异步调用链
3. task.ContinueWith中的回调可以取到到task的返回值，并且可以为其附加额外的参数
4. task.Wait可以让当前线程同步阻塞等待该任务完成，除此之外，还可以通过Task.WaitAny和Task.WaitAll来等待一个任务数组
5. 在任务执行完成后，通过task.Result可以取得异步任务的返回值，注意，如果此时任务未完成，将会同步阻塞等待任务完成
6. 如果没有指定TaskScheduler，默认的任务调度器只是在线程池中随机选一个线程来执行异步任务和对应回调

**但是！！！**
向上面这样使用Task，并不能指定线程，这意味着Task的执行仍然是随机的，这在一些场景下是不合适的。为了解决这个问题，我们需要使用TaskScheduler。

## TaskScheduler

TaskScheduler也是.NET Framework 4.0引入的新概念，它是用来管理任务的执行的。

按照原文的说法，C#中的TaskScheduler有两种：

1. **ThreadPoolTaskScheduler**：采用了对象池设计模式，它会在线程池中随机选一个线程来执行异步任务和对应回调。这也是默认的任务调度器。
2. **SynchronizationContextTaskScheduler**：它会在UI线程中执行异步任务和对应回调。是一种为UI提供的上下文线程，写过.NET开发（WPF、WinForm）的应该都比较熟悉。

你可以通过 **TaskScheduler** 来控制任务的执行方式。例如，你可以指定一个特殊的调度器让任务在特定的线程上执行，比如 **UI线程（主线程）**。这在GUI编程中非常重要，因为你不能在后台线程直接操作UI控件。

而 **同步上下文** 是一种抽象，提供了在多线程程序中如何切换线程或控制任务执行的方式。例如，在Windows Forms或WPF应用中，UI更新通常必须在UI线程中完成。**SynchronizationContext** 就是用来处理这种情况的。当你通过 **TaskScheduler.FromCurrentSynchronizationContext()** 获取当前的同步上下文时，你就指定了任务在主线程（UI线程）上执行，这对于UI框架特别重要。

所以说白了，同步上下文可以当成 **线程指针** 来使用，它指向当前正在执行的线程。

```csharp

static void Main(string[] args) {
{
    // 创建并设置当前线程的SynchronizationContext
    // 否则TaskScheduler.FromCurrentSynchronizationContext()调用会触发System.InvalidOperationException异常
    var context = new SynchronizationContext();
    SynchronizationContext.SetSynchronizationContext(context);
    Console.WriteLine("main thread{0}", Thread.CurrentThread.ManagedThreadId);
    Task<int> task = new Task<int>(() =>
    {
        Console.WriteLine("task thread{0}", Thread.CurrentThread.ManagedThreadId);
        return 1;
    });
    task.Start();
    task.ContinueWith(t =>
    {
        Console.WriteLine("continuewith result: {0}, thread{1}", t.Result, Thread.CurrentThread.ManagedThreadId);

    }, TaskScheduler.FromCurrentSynchronizationContext()).Wait();
}

// Output:
// main thread1
// task thread3
// continuewith result: 1, thread4
```

综合起来使用就这上面这样。

## C# async/await

.NET 4.5引入了async/await关键字，它可以让你以同步的方式编写异步代码。

```csharp
public static async void AsyncTask()
{
    Console.WriteLine("before await, thread{0}", Thread.CurrentThread.ManagedThreadId);
    var a = await Task.Run(() =>
    {
        Thread.Sleep(500);
        Console.WriteLine("in task, thread{0}", Thread.CurrentThread.ManagedThreadId); 
        return 666;
    });
    Console.WriteLine("after await, got result: {0}, thread{1}", a, Thread.CurrentThread.ManagedThreadId);
}
static void Main(string[] args)
{
    Console.WriteLine("Main: before AsyncTask thread{0}", Thread.CurrentThread.ManagedThreadId);
    var r = AsyncTask().Result;
    Console.WriteLine("Main: after AsyncTask result: {0} thread{1}", r, Thread.CurrentThread.ManagedThreadId);
}
// Output:
// Main: before AsyncTask thread1
// AsyncTask: before await, thread1
// AsyncTask: in task, thread3
// AsyncTask: after await, got result: 666, thread3
// Main: after AsyncTask result: 667 thread1
```

上面这段代码中，

**async** 使得 **AsyncTask** 方法成为一个异步方法，执行到 **await** 时，线程不会被阻塞。

**await** 后面的 **Task.Run()** 表示开始一个异步任务，这个任务会在不同的线程上执行（通过线程池），并在完成后将结果返回。

事实上，**async** 修饰一个方法，表示这个方法是异步的，且返回值是一个 **Task** 或 **Task< T >**（也可以是**void**，但最好避免）。
**await** 用来等待一个异步任务完成，并返回其结果。它会让控制权返回到调用者处，并且不会阻塞线程，直到任务完成。

### 实现原理

**async/await** 本质上是 **编译器的语法糖**，它通过自动生成一个状态机来管理异步任务的执行流程。

你在代码中写的 **await** 实际上被编译成了状态机的一部分，并且通过回调来控制异步操作的继续执行。

#### 那么编译器是如何工作来实现 async/await 的呢？

编译器为每个 async 方法生成一个实现了 **IAsyncStateMachine** 接口的状态机。

**await** 后面的任务会生成一个 **Awaiter** 对象，这个对象会被用来管理异步任务的完成和回调。

**async** 方法在执行到 **await** 时会停止，直到任务完成，并继续执行剩余代码。

### 线程切换

通过 **状态机**，**async/await** 可以控制代码的执行顺序和异步任务的切换。状态机通常根据任务的完成状态来决定是否继续执行下一步操作。

- 线程切换：

  - await 会影响当前线程的执行。当一个异步操作在不同线程上完成时，可能会涉及线程的切换。
  - 默认情况下，await 会在任务完成后返回到原线程（这通常是主线程），但是你可以通过 ConfigureAwait(false) 来禁用这一行为，避免不必要的线程切换。

示例：

```csharp
var result = await someTask.ConfigureAwait(false); // 不会捕获同步上下文，避免线程切换
```

- 自定义同步上下文（SynchronizationContext）：

  - 如果你在UI线程上执行 await，SynchronizationContext 会捕获当前线程的信息，并确保异步操作在UI线程完成后继续执行。
  - 你可以自定义 SynchronizationContext，例如在测试或非UI线程中执行时。

### async/await 与 Task 结合使用

**async/await** 结合 **Task** 对象来进行异步编程。你可以使用 **Task.Run()** 来启动后台任务，使用 **await** 等待其结果。

```csharp
// 因为没有async标注，所以编译器不会为该函数生成状态机，但由于该函数返回的是Task，因此可以直接用于await
public static Task<int> F1Async()
{
    return Task.Run(() => { return 2; });
}

// 只要标记了async 就会生成对应状态机，但这里有几点需要注意:
// 1. 如果方法声明为 async，那么可以直接 return 异步操作返回的具体值，不再用创建Task，由编译器通过builder创建Task
// 2. 由于该函数体内没有使用await，整个状态机相当于直接builder.SetResult(2)，其中不涉及异步操作和线程切换(没有await异步切换点)，因此整个过程实际上都是在主线程同步进行的(虽然经过了一层builder.Task封装)
// 3. 编译器也会提示Warning CS1998: This async method lacks 'await' operators and will run synchronously.
public static async Task<int> F2Async()
{
    return 2;
}

// 该方法在Task上套了一层空格子Task，看起来好像和F1Async没区别
// 但实际上，编译器仍然会生成对应的builder和wrapper task，这个wrapper task在原task完成之后，只是做了简单的return操作
// 因此 await F3Async() 实际上可能导致两次线程上下文切换，如果是在UI线程上执行await，用法不当则可能触发"async/await 经典UI线程卡死"场景，因为await会默认捕获SynchronizationContext。这个后面说。
public static async Task<int> F3Async()
{
    return await Task.Run(() => { return 2; });
}
```

这段注释写的好复杂，看不太懂，总结就是：

- F1Async：该方法没有async标注，但返回值是Task< int>，因此可以直接用于await。
- F2Async：因为没有 await，这个方法会同步执行，尽管它是异步方法。
- F3Async：虽然 F3Async 本身是异步的，但因为它内部有一个 await，所以可能会导致两次线程切换。

### 线程切换与 UI 线程卡死

在UI编程中，如果你使用 **await** 来等待任务并且没有正确地配置同步上下文，可能会导致 UI线程卡死。

如果**await** 捕获了同步上下文，任务可能会在线程池线程中完成，而 **await** 之后的代码又需要在 UI 线程中执行。如果这时 **await** 没有正确地返回到 UI 线程，就会造成卡死。

解决方法：使用 **ConfigureAwait(false)** 来避免 **await** 捕获同步上下文，减少线程上下文切换。

### **await** 与 **yield** 的区别

yield 和 await 都生成状态机，但是它们的用途不同：

- yield 用于生成可枚举的序列（例如迭代器），用于同步操作。
- await 用于异步操作，在遇到等待时暂停执行，返回线程，直到任务完成。

### async/await 与 JavaScript Generator 异步

**async/await** 和 **JavaScript Generator** 在某些方面有相似之处。都通过状态机来管理异步流程，但 C# 的 async/await 是针对异步操作的高效封装，而 **JS Generator** 是一个更底层的控制流机制，通常需要外部函数来驱动。

## Unity async/await

Unity也引入了C# async/await机制，并对其进行了适配:

- Unity本身也是UI框架，因此它实现了自己的同步上下文**UnitySynchronizationContext**以及主线程的消息泵，如此await的异步委托会默认会回到Unity主线程执行(可通过task.ConfigureAwait配置)
- Unity社区提供了针对大部分常见**YieldInstruction**(如WaitForSeconds)，以及其他常用库(如UnityWebRequest、ResourceRequest)的**GetAwaiter**适配(如Unity3dAsyncAwaitUtil)

所以，这就是大家所说的，Unity的异步是一种**伪 async/await**，它**只是在Unity的上下文**中提供了一种异步编程的机制，并没有真正意义上的异步。

这里我们就按照原文的代码来看：

```csharp
// GetAwaiter
// 适配WaitForSeconds类的GetAwaiter方法，通过GetAwaiterReturnVoid返回其Awaiter对象
public static SimpleCoroutineAwaiter GetAwaiter(this WaitForSeconds instruction)
{
    return GetAwaiterReturnVoid(instruction);
}

// GetAwaiterReturnVoid
// 创建和返回Awaiter: SimpleCoroutineAwaiter
// 并在Unity主线程执行InstructionWrappers.ReturnVoid(awaiter, instruction)
static SimpleCoroutineAwaiter GetAwaiterReturnVoid(object instruction)
{
    var awaiter = new SimpleCoroutineAwaiter();
    RunOnUnityScheduler(() => AsyncCoroutineRunner.Instance.StartCoroutine(
        InstructionWrappers.ReturnVoid(awaiter, instruction)));
    return awaiter;
}

// InstructionWrappers.ReturnVoid
// 这里其实已经在Unity主线程，所以这里本质是将await最终换回了yield，由Unity来驱动WaitForSeconds的完成
// 只不过yield完成之后，通过awaiter.Complete回到Awaiter.OnCompleted流程去
public static IEnumerator ReturnVoid(
            SimpleCoroutineAwaiter awaiter, object instruction)
{
    // For simple instructions we assume that they don't throw exceptions
    yield return instruction;
    awaiter.Complete(null);
}

// 确保Action在Unity主线程上运行
// SyncContextUtil.UnitySynchronizationContext在插件Install的时候就初始化好了
// 如果发现当前已经在Unity主线程，就直接执行Action，无需自己Post自己
static void RunOnUnityScheduler(Action action)
{
    if (SynchronizationContext.Current == SyncContextUtil.UnitySynchronizationContext)
    {
        action();
    }
    else
    {
        SyncContextUtil.UnitySynchronizationContext.Post(_ => action(), null);
    }
}

// 真正的Awaiter，它是无返回值的，对应还有一个SimpleCoroutineAwaiter<T>版本
// 它的实现比较简单，就是适配接口，记录委托回调(_continuation)，并在Compele()任务完成时，通过RunOnUnityScheduler封送委托回调
public class SimpleCoroutineAwaiter : INotifyCompletion
{
    bool _isDone;
    Exception _exception;
    Action _continuation;

    public bool IsCompleted
    {
        get { return _isDone; }
    }

    public void GetResult()
    {
        Assert(_isDone);

        if (_exception != null)
        {
            ExceptionDispatchInfo.Capture(_exception).Throw();
        }
    }

    public void Complete(Exception e)
    {
        Assert(!_isDone);

        _isDone = true;
        _exception = e;

        // Always trigger the continuation on the unity thread when awaiting on unity yield
        // instructions
        if (_continuation != null)
        {
            RunOnUnityScheduler(_continuation);
        }
    }

    void INotifyCompletion.OnCompleted(Action continuation)
    {
        Assert(_continuation == null);
        Assert(!_isDone);

        _continuation = continuation;
    }
}
```

不管是WaitForSeconds本身，还是之后的回调委托，其实都是在Unity主线程中执行的，并且结合**RunOnUnityScheduler**的优化，整个过程**既不会创建线程，也不会产生额外的消息投递，只是在yield上加了一层壳子而已**。

总结就是，await/async终归只是语法糖，线程的操作还是**通过Awaiter，SynchronizationContext，ConfigureAwait等综合控制**。

## UniTask包

说来说去，咱只是个臭写程序的，还是把这些深奥的东西交给大佬们来实现。光有await/async当然是远远不够的，完全没有原生C#的异步编程体验。

所以，社区的大佬开发了UniTask包，它的目的是整合Coroutine的轻量、Task的并发、async/await的易用于一体，为开发者提供高性能、可并发、易使用的接口。

提供的功能包括但不限于：

- 基于值类型的 UniTask 和自定义的 AsyncMethodBuilder 来实现0GC
- 使所有 Unity 的 AsyncOperations 和 Coroutines 可等待 (类似Unity3dAsyncAwaitUtil的适配)
- 基于 PlayerLoop 的任务(UniTask.Yield, UniTask.Delay, UniTask.DelayFrame…)可以替代所有协程操作
- 对 MonoBehaviour 消息事件和 uGUI 事件进行 可等待/异步枚举 拓展
  与C#原生 Task/ValueTask/IValueTaskSource 行为高度兼容
- ...

> UniTask将**Unity单线程异步编程**诸多实践与**async/await异步编程模型**有机整合，并对Unity Coroutine与C# Task的诸多痛点进行优化和升级，看起来确实有一统Unity异步编程模型的潜力，应该离整合进Unity官方包也不远了。

## 总结

大佬说道：

> 异步编程模型一直在演进，**看起来写越来越”简单”，可读性越来越”高”，代价是编译器和运行时做了更多的工作**，并且这些工作和原理是作为开发者必须要了解的，以C# async/await为例，如果不能充分了解底层原理，就容易引发:

- 异步回调闭包引用**可变上下文**的问题
- async “无栈编程”本身带来的**理解负担和调试难度**
- 代码的线程上下文难以分析，容易引发**并发**安全访问的问题
- 同一段代码在不同的线程执行可能具有完全不同的行为(SynchronizationContext和ExecuteContext不同)

> 等问题。语言和框架本身只提供选择，作为使用者的我们，在并发越来越”容易”的同时，保持对原理的理解，才能充分发挥工具的作用(享受上限高的好处，避免下限低的问题)。
