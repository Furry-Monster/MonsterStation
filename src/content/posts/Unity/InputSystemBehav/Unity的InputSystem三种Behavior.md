---
title: Unity的InputSystem三种Behavior
published: 2025-01-20
image: ./cover.png
description:  Unity的InputSystem提供了三种Behavior，分别是Send / Broadcast Messages、Invoke CSharp Events、Invoke Unity Events。本文将对这三种Behavior进行详细的介绍。
tags: [Unity,游戏开发]
category: Unity笔记
draft: false
---
# 三类Behavior辨析

## Send / Broadcast Messages

PlayerInput.cs类内部使用GameObject.SendMessage()或者GameObject.BroadcastMessage()方法，本质都是使用反射方式实现方法调用的。

- 这两种Behavior采用约定的方式，当某Action触发时，自动查找当前PlayerInput所属GameObject的 " On+对应action名 " 方法，进行方法调用。所以使用时，遵循这种约定，添加 " On+对应action名 " 的方法即可。
- Broadcast Messages 与Send Message的区别就是Broadcast 除了当前GameObject，还会查找所有子对象是否有对应方法，会一并调用。
- 这种约定的方法名是PlayerInput初始化时进行缓存的：

```
void CacheMessageNames()
{
    if (m_Actions == null)
        return;
    if (m_ActionMessageNames != null)
        m_ActionMessageNames.Clear();
    else m_ActionMessageNames = new Dictionary<string, string>();
    foreach (var action in m_Actions)
    {
        action.MakeSureIdIsInPlace();
        var name = CSharpCodeHelpers.MakeTypeName(action.name);
        m_ActionMessageNames[action.m_Id] = "On" + name;
    }
}
```

**特别注意：**

1. Send/Broadcast Messages方式，目前只处理performed或者type为value的canceled的回调，所以对于这两种方式，Button类型Action的按键释放通知是不处理的。
2. 反射对方法名大小写敏感，方法大小写不匹配时方法不触发，但不报异常

> action name在上面cacheName 时首字母会转成大写，所以写方法时注意，比如action叫fireCube，但方法要写成OnFireCube，写成OnfireCube或者OnFirecube都是无法触发的

3. 方法可以带InputValue参数，但无参和有参同时存在只会调用首先声明的那一个

> 如果方法名正确，但带错参数会报MissingMethodException，比如你像另两个behavior一样带CallbackContext是不行的。

```
//哪个写在前面调用谁
public void OnFireCube(InputValue value)
{
    Debug.Log("父对象触发fire action，value=" + value.Get<float>());
}
public void OnFireCube()
{
    Debug.Log("父对象触发fire action");
}
```

## Invoke CSharp Events

使用原生c#事件方式，利用PlayerInput.onActionTriggered事件间接监听action事件触发：

```
private void Start()
{
    var playerInput = GetComponent<PlayerInput>();
    playerInput.onActionTriggered += context =>
    {
        switch (context.action.name)
        {
            case "fireCube":
                OnFire(context);
                break;
        }
    };
}
public void OnFire(InputAction.CallbackContext context)
{
    switch (context.phase)
    {
        case InputActionPhase.Performed:
            Debug.Log("c#Event performed:value="+context.ReadValue<float>());
            break;
        case InputActionPhase.Canceled:
            Debug.Log("c#Event canceled:value="+context.ReadValue<float>());
            break;
        case InputActionPhase.Started:
            Debug.Log("c#Event start:value="+context.ReadValue<float>());
            break;
    }
}

```

当然你也可以不用PlayerInput的事件，直接用InputSystem、ActionMap或者Action注册回调。

```
class MyPlayerInputScript : MonoBehaviour
{
    private void Awake()
    {
        // 需要访问PlayerInput组件和相关的Action
        PlayerInput playerInput = GetComponent<PlayerInput>();
        InputAction hit = playerInput.actions["Fire"];
        // 手动注册回调函数
        hit.started += OnFireStarted;
        hit.performed += OnFirePerformed;
        hit.canceled += OnFireCanceled;
    }
    void OnFireStarted(InputAction.CallbackContext context)
    {
        var v = context.ReadValue<float>();
        Debug.Log(string.Format("Fire Started:{0}", v));
    }
    void OnFirePerformed(InputAction.CallbackContext context)
    {
        var v = context.ReadValue<float>();
        Debug.Log(string.Format("Fire Performed:{0}", v));
    }
    void OnFireCanceled(InputAction.CallbackContext context)
    {
        var v = context.ReadValue<float>();
        Debug.Log(string.Format("Fire Canceled:{0}", v));
    }
}

```

## Invoke Unity Events ⭐

Invoke Unity Event方式，和原生c#逻辑是类似的，只不过是用UI操作代替code罢了。因为需要UI操作，所以用了Unity Event，在PlayerInput组件引入ActionEvent[] m_ActionEvents即可，Inspector中就会多出Events列表，对ActionAsset中每个action都可以注册一个回调方法，注册的方法是

1. 前一个候选框选择方法所在的对象（或对象上的任意组件，不能单是脚本！）
2. 选择方法所在的脚本，并选择此方法

> 这种behavior的回调方法也可以带CallbackContext参数，使用和c#event相同：

```
public void OnFire(InputAction.CallbackContext context)
{
    if(context.phase == InputActionPhase.Performed)
    {
      Debug.Log("c#Event performed:value="+context.ReadValue<float>());
    }
}
```

## 三类消息通知方式比较

- sendMessage / boardcast
  这种方式虽然使用简单，但需要搜索一个潜在的庞大组件列表，以找到那些包含匹配方法的组件，这引入了大量的开销。更糟糕的是，由于它们使用字符串作为方法名称，因此它们使用反射来标识匹配的方法。在这种情况下，反射是在运行时与类型系统交互和修改类型系统的能力，但通过反射调用方法比以正常方式调用方法慢。如果你使用一次或两次反射，这很好，但如果你经常使用，那么这些小的性能影响就会加起来。不仅如此，由于所有这些都发生在运行时，因此根本没有编译时错误检查。这使得方法名称中的拼写错误等小错误更容易需要很长时间才能调试。
- PlayerInput的输入触发通知的本质就是给Action的三个事件performed、canceled、started注册回调，只不过差别在，C#Event需要手动通过代码方式注册，而sendMessage 用的约定、UnityEvent用的UI绑定默认注册罢了。

> 总的来说：sendMessage 最方便，但性能最差、灵活性不佳；UnityEvent最直观，性能一般；C#Event 最灵活、性能最好，但操作稍麻烦。根据需要选择适合的Behavior。
