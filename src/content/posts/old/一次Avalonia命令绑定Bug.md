---
title: 一次Avalonia命令绑定Bug
published: 2024-11-06
image: ./ava.png
description: 一次Avalonia命令绑定Bug，越过单例限制报错强如怪物，拼尽全力终于战胜
tags: [dotNET,Avalonia,Debug]
category: 解决方案
draft: false
---
（~~Avalonia偶遇Command绑定Bug，越过单例限制报错强如怪物，拼尽全力终于战胜~~）

算是开发阶段中第一次吃了单例不加锁的亏，前前后后排查了一整天，给群里大佬问红温了都。。。

简单来说，代码最开始是这样的：

```xml
<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             xmlns:vm="clr-namespace:ItemsPanelMainCommand.ViewModels"
             mc:Ignorable="d" d:DesignWidth="800" d:DesignHeight="450"
             x:Class="ItemsPanelMainCommand.Views.MainView"
             x:DataType="vm:MainViewModel">
  <Design.DataContext>
    <vm:MainViewModel />
  </Design.DataContext>
    <ItemsControl ItemsSource="{Binding Items}">
        <ItemsControl.ItemTemplate>
            <DataTemplate>
                <StackPanel Orientation="Horizontal">
                    <TextBlock Text="{Binding Name}"></TextBlock>
                    <Button Command="{Binding DeleteCommand}" CommandParameter="{Binding}">删除</Button>
                </StackPanel>
            </DataTemplate>
        </ItemsControl.ItemTemplate>
    </ItemsControl>
</UserControl>
```

事实上，Button绑定Command的时候，DataContext并不是**MainViewModel**而是**Items**，我们需要找到最外层的DataContext。

一般来说，正常情况会这样解决：

```xml
<Button Command="{Binding $parent[ItemsControl].DataContext.DeleteCommand}" x:CompileBindings="False" CommandParameter="{Binding}">删除-方案1</Button>
<Button Command="{ReflectionBinding $parent[ItemsControl].DataContext.DeleteCommand}" CommandParameter="{Binding}">删除-方案2</Button>
<Button Command="{Binding $parent[ItemsControl].((vm:MainViewModel)DataContext).DeleteCommand }" CommandParameter="{Binding}">删除-方案3</Button>
```

或者这样解决：

```xml
<Button Command="{Binding RelativeSource={RelativeSource AncestorType=UserControl},Path=DataContext.OpenDesktopCommand}"
```

但是这次我干了点不一样的，因为之前学习大佬源码的时候，发现可以用一个ViewModelLocator手动进行ViewModel的管理，所以我就自己手搓了一个VMLocator：

```csharp
using ReactiveUI;
using System.Collections.Generic;
using System;

namespace SharpDesktop.ViewModels;

public class ViewModelLocator
{
    // 单例模式
    private static ViewModelLocator? _instance;

    public static ViewModelLocator Instance => _instance ??= new ViewModelLocator();

    public ViewModelLocator()
    {
        _instance = this;
        _dic = new Dictionary<Type, ViewModelBase?>();
    }

    #region 操作
    /// <summary>
    /// 初始化
    /// </summary>
    /// <param name="hostScreen"> 宿主屏幕 </param>
    /// <returns> ViewModelLocator 实例 </returns>
    public ViewModelLocator Init(IScreen hostScreen)
    {
        _hostScreen = hostScreen;

        // 注册路由视图模型
        Instance.RegisterRoutable<DesktopViewModel>(hostScreen)
                .RegisterRoutable<ResourceViewModel>(hostScreen)
                .RegisterRoutable<WorkspaceViewModel>(hostScreen)
                .RegisterRoutable<ToolboxViewModel>(hostScreen)
                .RegisterRoutable<TerminalViewModel>(hostScreen)
                .RegisterRoutable<AiViewModel>(hostScreen);

        return Instance;
    }

    /// <summary>
    /// 注册视图模型
    /// </summary>
    /// <typeparam name="TViewModel"> 视图模型类型 </typeparam>
    /// <typeparam name="TConcrete"> 视图模型的实例 </typeparam>
    public ViewModelLocator Register<TViewModel, TConcrete>() where TViewModel : ViewModelBase where TConcrete : TViewModel
    {
        var viewModelInstance = Activator.CreateInstance<TConcrete>();
        _dic[typeof(TViewModel)] = viewModelInstance ?? throw new InvalidOperationException($"无法创建类型 {typeof(TViewModel).Name} 的实例");
        return Instance;
    }

    /// <summary>
    ///  注册可路由的视图模型
    /// </summary>
    /// <typeparam name="TViewModel"> 视图模型类型 </typeparam>
    /// <param name="hostScreen"> 宿主屏幕 </param>
    public ViewModelLocator RegisterRoutable<TViewModel>(IScreen hostScreen) where TViewModel : ViewModelBase
    {
        if (hostScreen is null) throw new ArgumentNullException(nameof(hostScreen));

        // 使用反射创建 TViewModel 的实例
        var viewModelInstance = Activator.CreateInstance(typeof(TViewModel), hostScreen) as TViewModel;
        _dic[typeof(TViewModel)] = viewModelInstance ?? throw new InvalidOperationException($"无法创建类型 {typeof(TViewModel).Name} 的实例");

        return Instance;
    }

    /// <summary>
    /// 获取视图模型实例
    /// </summary>
    /// <typeparam name="TViewModel"> 视图模型类型 </typeparam>
    /// <returns> 视图模型实例 </returns>
    /// <exception cref="ArgumentException"> 未注册视图模型 </exception>
    public TViewModel GetInstance<TViewModel>() where TViewModel : ViewModelBase
    {
        if (_dic.TryGetValue(typeof(TViewModel), out var vm))
        {
            return (TViewModel)vm!;
        }

        throw new ArgumentException($"未注册{typeof(TViewModel).Name}的视图模型");
    }

    /// <summary>
    /// 判断是否注册了视图模型
    /// </summary>
    /// <typeparam name="TViewModel"> 视图模型类型 </typeparam>
    /// <returns> 是否注册了视图模型 </returns>
    public bool IsRegistered<TViewModel>() where TViewModel : ViewModelBase
    {
        return _dic.ContainsKey(typeof(TViewModel));
    }

    /// <summary>
    /// 注销视图模型
    /// </summary>
    /// <typeparam name="TViewModel"> 视图模型类型 </typeparam>
    public ViewModelLocator Unregister<TViewModel>() where TViewModel : ViewModelBase
    {
        _dic.Remove(typeof(TViewModel));
        return Instance;
    }

    /// <summary>
    /// 清空所有视图模型
    /// </summary>
    public ViewModelLocator Clear()
    {
        _dic.Clear();
        return Instance;
    }

    /// <summary>
    /// 尝试获取视图模型
    /// </summary>
    /// <param name="type"> 视图模型类型 </param>
    /// <param name="vm"> 视图模型实例 </param>
    /// <returns> 是否获取成功 </returns>
    public bool TryGetViewModel(Type type, out ViewModelBase? vm)
    {
        return _dic.TryGetValue(type, out vm);
    }

    /// <summary>
    /// 尝试获取视图模型
    /// </summary>
    /// <typeparam name="TViewModel"> 视图模型类型 </typeparam>
    /// <param name="vm"> 视图模型实例 </param>
    /// <returns> 是否获取成功 </returns>
    public bool TryGetViewModel<TViewModel>(out TViewModel? vm) where TViewModel : ViewModelBase
    {
        if (_dic.TryGetValue(typeof(TViewModel), out var v))
        {
            vm = (TViewModel)v!;
            return true;
        }

        vm = default;
        return false;
    }

    /// <summary>
    /// 尝试获取视图模型
    /// </summary>
    /// <typeparam name="TViewModel"> 视图模型类型 </typeparam>
    /// <param name="vm"> 视图模型实例 </param>
    /// <returns> 是否获取成功 </returns>
    public bool TryGetViewModel<TViewModel>(out ViewModelBase? vm) where TViewModel : ViewModelBase
    {
        if (_dic.TryGetValue(typeof(TViewModel), out var v))
        {
            vm = v;
            return true;
        }

        vm = default;
        return false;
    }

    #endregion

    // 属性与字段

    // 从类型到视图实例的字典
    private readonly Dictionary<Type, ViewModelBase?> _dic;

    // 宿主屏幕
    private IScreen? _hostScreen;

    public IScreen HostScreen
    {
        get => _hostScreen ?? throw new InvalidOperationException("未设置HostScreen");
        set => _hostScreen = value;
    }

    // 内置注册的视图模型

    public DesktopViewModel DesktopViewModel => this.GetInstance<DesktopViewModel>();

    public ResourceViewModel ResourceViewModel => this.GetInstance<ResourceViewModel>();

    public WorkspaceViewModel WorkspaceViewModel => this.GetInstance<WorkspaceViewModel>();

    public ToolboxViewModel ToolboxViewModel => this.GetInstance<ToolboxViewModel>();

    public TerminalViewModel TerminalViewModel => this.GetInstance<TerminalViewModel>();

    public AiViewModel AiViewModel => this.GetInstance<AiViewModel>();

}
```

这不写还好，一写就开始出Bug了。

我在BackCode和View中都注册了这个ViewModelLocator：

App.axaml.cs

```csharp
// 注册ViewModelLocator
ViewModelLocator.Instance.Init(state);
```

App.axaml

```xml
<Application.Resources>
 <ResourceDictionary>
  <vm:ViewModelLocator x:Key="VmLocator"/>
 </ResourceDictionary>
</Application.Resources>
```

然后当我用Source绑定的时候，直接报错了...

```xml
Command="{Binding Source={StaticResource VmLocator},Path=DesktopViewModel.OpenDesktopCommand}"
```

> C:\Users\Hanser no maoguai\source\repos\SharpDesktop\SharpDesktop\Views/DesktopView.axaml(43,19,43,19): Avalonia error AVLN2000: Unable to resolve property or method of name 'DesktopViewModel' on type 'System.Object'. 第 43 行，位置 19。

不管我怎么改都编译不了，传入的值总是错误的，遂求助群里大佬，大佬让关掉编译绑定，虽然编译通过了，但是加载这个View仍然会报错，提示无法从空值解析到ViewModel。

原因其实很简单。。。因为Avalonia的App中，BackCode和View各自注册了一个ViewModelLocator。。。我在断点调试时候发现，加载View的时候，ViewModelLocator调用了两次 `GetInstance<ViewModel>()`，第一次的TryGet有结果是True，第二次却是False，监视VM发现。。。这俩根本就不是一个单例。。。

至于为啥能创建两个单例，我也没深究，可能是我没加线程锁的原因。

最后我还是用RelativeResource解决的绑定问题：

```xml
Command="{Binding RelativeSource={RelativeSource AncestorType=UserControl},Path=DataContext.OpenDesktopCommand}"
```
