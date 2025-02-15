---
title: Java内部类的应用分析
published: 2024-10-08
description: 没活硬整，瞎几把写
tags: [语言,Java]
category: Java
draft: false
---
最近看了几篇博客，又温习了一次内部类相关的内容，感觉有必要在这方面写点博客记录一下，毕竟我个人接触的也不多，平时写代码也不常用，方便以后再次温习。

啥是内部类呢，简单来说就是**写在类里面的类(Inner Class)**，也被叫做**嵌套类（Nested Class）**

```java
class Outer {
    class Inner {
        // 定义了一个Inner Class
    }
}
```

具体的介绍可以看这里：[内部类 - Java教程 - 廖雪峰的官方网站 (liaoxuefeng.com)](https://liaoxuefeng.com/books/java/oop/basic/inner-class/index.html "内部类 - Java教程 - 廖雪峰的官方网站 (liaoxuefeng.com)")，我在这里就不多赘述了。

内部类是一个统称，具体的分类有哪些呢？

![img](https://i-blog.csdnimg.cn/direct/a6afe705478f4e2ba9ab9c5bf83a31e4.png)

### 内部类的主要应用

* **访问外部类的私有成员** ，类似于写一个getter/setter方法，提供了一个外部管理私有字段的方法。我们来举个例子：

  ```java
  public class Outer {
      private String outerField = "Hello from Outer Class!";

      // 成员内部类
      class Inner {
          void displayOuterField() {
              // 内部类访问外部类的私有成员
              System.out.println(outerField);
          }
      }

      // 创建内部类的实例并调用其方法
      void createInner() {
          Inner inner = new Inner();
          inner.displayOuterField();
      }

      public static void main(String[] args) {
          Outer outer = new Outer();
          outer.createInner();  // 调用外部类的方法
      }
  }
  ```

* **封装代码** ，从第一条就能看出来。
* **简化代码结构** ，例如想要手动实现一个表，那么这个表的数据结构肯定会占很大篇幅，这时候不妨把代码放到内部类，和其他逻辑区分开。比如我们来写一个图的结构：

  ```java
  import java.util.ArrayList;
  import java.util.List;

  public class Graph {
      // 内部类表示图的顶点
      class Vertex {
          String name;
          List<Vertex> adjacentVertices;

          // 构造函数
          Vertex(String name) {
              this.name = name;
              this.adjacentVertices = new ArrayList<>();
          }

          // 添加邻接顶点
          void addAdjacent(Vertex vertex) {
              adjacentVertices.add(vertex);
          }

          // 打印顶点及其邻接顶点
          void display() {
              System.out.print("Vertex: " + name + " is connected to: ");
              for (Vertex v : adjacentVertices) {
                  System.out.print(v.name + " ");
              }
              System.out.println();
          }
      }

      private List<Vertex> vertices;

      // 构造函数
      public Graph() {
          this.vertices = new ArrayList<>();
      }

      // 添加顶点
      public Vertex addVertex(String name) {
          Vertex vertex = new Vertex(name);
          vertices.add(vertex);
          return vertex;
      }

      // 打印所有顶点
      public void displayGraph() {
          for (Vertex vertex : vertices) {
              vertex.display();
          }
      }

      public static void main(String[] args) {
          Graph graph = new Graph();
          Graph.Vertex v1 = graph.addVertex("A");
          Graph.Vertex v2 = graph.addVertex("B");
          Graph.Vertex v3 = graph.addVertex("C");

          // 添加邻接关系
          v1.addAdjacent(v2);
          v1.addAdjacent(v3);
          v2.addAdjacent(v3);

          // 打印图的信息
          graph.displayGraph();
      }
  }
  ```

**处理监听事件** ，这个和c#的事件委托机制很像，例如有了内部类，可以把所有鼠标点击回调的逻辑放到一个内部类里，以后需要添加或修改鼠标点击的逻辑的时候，只需要修改这个内部类就可以了
举个例子：

```java
import javax.swing.JButton;
import javax.swing.JFrame;
 
public class ButtonExample {
    private String buttonLabel = "Click me!";
 
    public ButtonExample() {
        JFrame frame = new JFrame();
        JButton button = new JButton(buttonLabel);
 
        // 成员内部类作为事件监听器
        button.addActionListener(new ButtonClickListener());
 
        frame.add(button);
        frame.setSize(200, 200);
        frame.setVisible(true);
    }
 
    // 内部类
    class ButtonClickListener implements java.awt.event.ActionListener {
        public void actionPerformed(java.awt.event.ActionEvent e) {
            System.out.println("Button clicked! Label: " + buttonLabel);
        }
    }
 
    public static void main(String[] args) {
        new ButtonExample();
    }
}
```

**实现接口，或者多重继承** ，我们不想让外部访问到我们的实现方式，只需要在私有的内部类里面写接口的实现即可。

```java
// 定义接口
interface Animal {
    void makeSound();  // 声明一个抽象方法
}
 
// 外部类
public class AnimalShelter {
  
    // 成员内部类 Dog
    private class Dog implements Animal {
        @Override
        public void makeSound() {
            System.out.println("Woof!");  // 实现狗叫声
        }
    }
 
    // 成员内部类 Cat
    private class Cat implements Animal {
        @Override
        public void makeSound() {
            System.out.println("Meow!");  // 实现猫叫声
        }
    }
 
    // 方法来创建并使用内部类
    public void adoptAnimals() {
        Animal dog = new Dog();  // 创建 Dog 对象
        Animal cat = new Cat();   // 创建 Cat 对象
 
        dog.makeSound();  // 调用 Dog 的方法
        cat.makeSound();  // 调用 Cat 的方法
    }
 
    public static void main(String[] args) {
        AnimalShelter shelter = new AnimalShelter(); // 创建 AnimalShelter 对象
        shelter.adoptAnimals(); // 调用 adoptAnimals 方法
    }
}
```

至于 **静态内部类** ，大多是在**设计模式**中应用，例如实现工厂模式中的工厂类：

```java
public class Outer {
    private static int count = 0;
 
    // 静态内部类
    static class Inner {
        private int id;
 
        Inner() {
            this.id = ++count;  // 为每个内部类实例分配一个唯一 ID
        }
 
        public int getId() {
            return id;
        }
    }
 
    public static void main(String[] args) {
        Inner inner1 = new Inner();
        Inner inner2 = new Inner();
 
        System.out.println("Inner 1 ID: " + inner1.getId());  // 输出：Inner 1 ID: 1
        System.out.println("Inner 2 ID: " + inner2.getId());  // 输出：Inner 2 ID: 2
    }
}
```

方法内部类我用的较少，但是还是举个例子，这是用 **局部内部类（方法内部类）进行临时算法的封装** ：

```java
public class Calculator {
  
    public double calculate(int base, int exponent) {
    
        // 局部静态类用于计算幂
        class PowerCalculator {
            double calculatePower() {
                return Math.pow(base, exponent);
            }
        }
    
        PowerCalculator powerCalculator = new PowerCalculator();
        return powerCalculator.calculatePower();  // 调用局部静态类的方法
    }
 
    public static void main(String[] args) {
        Calculator calculator = new Calculator();
        double result = calculator.calculate(2, 3);  // 2的3次方
        System.out.println("Result: " + result);  // 输出：Result: 8.0
    }
}
```

匿名内部类比较特殊，不需要变量名，创建时自带一个生命周期，在生命周期内自动被调用，也就是说，匿名内部类一般和其他的类或者方法是绑定在一起的，由其他的类或方法来控制其行为。它的应用大概有这些：

* **事件处理** ，这里先给出一个例子

  ```java
  import javax.swing.JButton;
  import javax.swing.JFrame;

  public class ButtonExample {
      public static void main(String[] args) {
          JFrame frame = new JFrame("Button Example");
          JButton button = new JButton("Click me!");

          // 使用匿名内部类实现 ActionListener
          button.addActionListener(new java.awt.event.ActionListener() {
              @Override
              public void actionPerformed(java.awt.event.ActionEvent e) {
                  System.out.println("Button clicked!");
              }
          });

          frame.add(button);
          frame.setSize(200, 200);
          frame.setVisible(true);
          frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
      }
  }
  ```

这里和C#的事件委托机制是一样的，只是java有些区别罢了，创建的事件类并没有一个确切的名字，它单纯是和我们的buttonclick绑定在了一起，每次这个按钮被点击，就会激活这个事件，但是具体这个事件较什么名字我们并不清楚，只知道要让这个事件去做一些事，调一些函数。

* **代码简化**

  ```java
  public class AnimalExample {
      public static void main(String[] args) {
          // 使用匿名内部类实现接口
          Animal dog = new Animal() {
              @Override
              public void makeSound() {
                  System.out.println("Woof!");
              }
          };

          dog.makeSound();  // 输出：Woof!
      }
  }
  ```

* **实现比较器** ，集合排序的时候是需要一个比较器的，也就是我们排序需要一个规则，这和数据库的理论很像，这个时候我们可以用匿名内部类来实现Comparator接口：

  ```java
  import java.util.Arrays;
  import java.util.Comparator;

  public class SortExample {
      public static void main(String[] args) {
          String[] names = {"Alice", "Bob", "Charlie"};

          // 使用匿名内部类实现Comparator
          Arrays.sort(names, new Comparator<String>() {
              @Override
              public int compare(String s1, String s2) {
                  return s1.length() - s2.length();  // 按字符串长度排序
              }
          });

          System.out.println(Arrays.toString(names));  // 输出：[Bob, Alice, Charlie]
      }
  }
  ```
