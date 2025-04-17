---
title: 通过EF在Avalonia中操作Sqlite
published: 2024-10-31
description: ORM是我主人
tags: [.NET, Avalonia, EFCore, Sqlite]
category: 技术杂文
draft: false
---
首选我们建个MVVM模板的项目，在项目中引入包 `Microsoft.EntityFrameworkCore.Sqlite`

1、创建实体

```c#
public class TodoEntity
{
    public Guid Id { get; set; }

    public string Thing { get; set; }

    public DateTime CreateTime { get; set; }
}
```

2、创建上下文

```cs
ublic class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options)
        : base(options)
    {
    }
  
    public DbSet<TodoEntity> TodoEntities { get; set; }

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<TodoEntity>(m =>
        {
            m.ToTable("todo");
            m.Property(c => c.Id);
            m.Property(c => c.Thing).IsRequired();
            m.HasKey(c => c.Id);
        });
    }
}
```

3、创建Factory

```csharp
public class DatabaseContextFactory
{
    public DatabaseContext CreateDbContext(string[] args)
    {

        var m = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "todo.db");
        var options = new DbContextOptionsBuilder<DatabaseContext>();
        options.UseSqlite($"Data Source={m};");
        return new DatabaseContext(options.Options);
    }

    public DatabaseContext CreateDbContext() => CreateDbContext(new string[0]);
}

```

4、启动时创建一下数据库

```csharp
 public override void OnFrameworkInitializationCompleted()
    {
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            desktop.MainWindow = new MainWindow();

            desktop.Startup += OnDesktopOnStartup;
        }

        base.OnFrameworkInitializationCompleted();
    }

    private void OnDesktopOnStartup(object sender, ControlledApplicationLifetimeStartupEventArgs args)
    {
        using var db = new DatabaseContextFactory().CreateDbContext();
        db.Database.EnsureCreated();
    }
```

5、修改MainWindowViewModel

```csharp
public class MainWindowViewModel : ViewModelBase
{
    private ObservableCollection<TodoEntity> _todoEntities = new();

    public ObservableCollection<TodoEntity> TodoEntities
    {
        get => _todoEntities;
        set => this.RaiseAndSetIfChanged(ref _todoEntities, value);
    }

    public void Add(string thing)
    {
        using var db = new DatabaseContextFactory().CreateDbContext();
        db.TodoEntities.Add(new TodoEntity()
        {
            Id = new Guid(),
            Thing = thing,
            CreateTime = DateTime.Now
        });
        db.SaveChanges();
    }

    public void Refresh()
    {
        using var db = new DatabaseContextFactory().CreateDbContext();
        var m = db.TodoEntities.ToList();
        TodoEntities.Clear();
        TodoEntities.AddRange(m);
    }
  
    public void Clear()
    {
        TodoEntities.Clear();
        using var db = new DatabaseContextFactory().CreateDbContext();
        var m = db.TodoEntities.ToList();
        db.TodoEntities.RemoveRange(m);
        db.SaveChanges();
    }
}
```

6、修改MainWindow

```xaml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:SqliteEFDemo.ViewModels"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        mc:Ignorable="d" d:DesignWidth="500" d:DesignHeight="450"
        Width="500"
        x:Class="SqliteEFDemo.Views.MainWindow"
        x:DataType="vm:MainWindowViewModel"
        Icon="/Assets/avalonia-logo.ico"
        Title="SqliteEFDemo">

    <Design.DataContext>
        <!-- This only sets the DataContext for the previewer in an IDE,
             to set the actual DataContext for runtime, set the DataContext property in code (look at App.axaml.cs) -->
        <vm:MainWindowViewModel/>
    </Design.DataContext>

    <Grid RowDefinitions="Auto,*">
        <StackPanel Orientation="Horizontal" Spacing="20" Margin="10 0">
            <TextBox Name="Thing" Width="200" />
            <Button Content="Add" x:Name="Add" Click="Add_OnClick"/>
            <Button Content="Refresh" x:Name="Refresh" Click="Refresh_OnClick"/>
            <Button Content="Clear" x:Name="Clear" Click="Clear_OnClick"/>
        </StackPanel>
    
        <StackPanel Orientation="Vertical" Grid.Row="1">
            <ItemsControl Items="{Binding TodoEntities}">
                <ItemsControl.ItemTemplate>
                    <DataTemplate>
                        <TextBlock Text="{Binding Thing}" Margin="20 10"/>
                    </DataTemplate>
                </ItemsControl.ItemTemplate>
            </ItemsControl>
        </StackPanel>
    </Grid>
  
</Window>

```

7、修改MainWindow.axaml.cs

```csharp
public partial class MainWindow : Window
{
    private MainWindowViewModel vm;
    public MainWindow()
    {
        InitializeComponent();
        vm = new MainWindowViewModel();
        this.DataContext = vm;
        vm.Refresh();
    }

    private void Add_OnClick(object? sender, RoutedEventArgs e)
    {
        var thingTb = this.FindControl<TextBox>("Thing");

        var s = thingTb?.Text?.Trim();
        if (!string.IsNullOrEmpty(s))
        {
            vm.Add(s);
            vm.Refresh();
        }
    }

    private void Refresh_OnClick(object? sender, RoutedEventArgs e)
    {
        vm.Refresh();
    }

    private void Clear_OnClick(object? sender, RoutedEventArgs e)
    {
        vm.Clear();
    }
}
```

![](https://img2023.cnblogs.com/blog/719904/202305/719904-20230529163532763-1335029925.png)

如果要使用加密的sqlite, 要引入包 `*SQLitePCLRaw.bundle_e_sqlcipher*` , 不然会出现

`You specified a password in the connection string, but the native SQLite library 'e_sqlite3' doesn't support encryption.` 的报错信息

同时把Factory改为下面这样

```csharp
public class DatabaseContextFactory
{
    public DatabaseContext CreateDbContext(string[] args)
    {
        var m = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "todo.db");
        var options = new DbContextOptionsBuilder<DatabaseContext>();

        //要加密 需要引入包 SQLitePCLRaw.bundle_e_sqlcipher
        var connStr = new SqliteConnectionStringBuilder()
        {
            DataSource = m,
            Mode = SqliteOpenMode.ReadWriteCreate,
            Password = "admin"
        }.ToString();

        options.UseSqlite(connStr);
        return new DatabaseContext(options.Options);
    }

    public DatabaseContext CreateDbContext() => CreateDbContext(new string[0]);
}
```
