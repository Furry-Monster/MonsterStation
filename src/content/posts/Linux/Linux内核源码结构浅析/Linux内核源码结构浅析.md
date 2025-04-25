---
title: Linux内核源码结构浅析
published: 2025-04-01
description: "粗浅Linux内核结构分析"
image: "./linux_hi.png"
tags: [OS,源码]
category: 技术杂文
draft: false 
lang: ''
---
## 结构注释

![img](https://linux-kernel-labs-zh.xyz/_images/ditaa-f45246aade5ecc7cfb71f7f103a57f95fc7c2b9e.png)

以下是 Linux 源代码文件夹的顶层目录：

* arch——包含架构（architecture）特定的代码；每个架构在特定的子文件夹中实现（例如 arm、arm64 以及 x86）
* block——包含与读写块设备数据相关的块子系统代码：创建块 I/O 请求、调度（scheduling）请求（有几个 I/O 调度程序可用）、合并请求，并将其通过 I/O 堆栈传递给块设备驱动程序
* certs——使用证书实现签名检查支持
* crypto——各种加密算法的软件实现，以及允许将这些算法分载到硬件中的框架
* Documentation——各个子系统的文档、对 Linux 内核命令行选项的描述、对 sysfs 文件和格式的描述以及设备树绑定（支持的设备树节点和格式）
* drivers——各种设备的驱动程序以及 Linux 驱动程序模型实现（对驱动程序、设备总线及其连接方式的抽象描述）
* firmware——由各种设备驱动程序使用的二进制或十六进制固件文件
* fs——虚拟文件系统（通用文件系统代码）以及各种文件系统驱动程序的位置
* include——头文件
* init——在启动过程中运行的通用（而不是特定于架构的）初始化代码
* io_uring——新型异步I/O模型接口 (替代了原有的AIO)
* ipc——对各种进程间通信系统（Inter Process Communication）调用的实现，例如消息队列、信号量、共享内存
* kernel——进程管理代码（包括对内核线程、工作队列的支持）、调度程序（scheduler）、跟踪、时间管理、通用中断代码（generic irq code）以及锁定（locking）
* lib——各种通用函数，例如排序、校验和、压缩和解压缩、位图操作等
* mm——内存管理代码，用于物理和虚拟内存，包括页面、SL*B 和 CMA 分配器、交换（swapping）、虚拟内存映射、进程地址空间操作等
* net——各种网络协议栈的实现，包括IPv4和IPv6；BSD 套接字实现、路由、过滤、数据包调度以及桥接（bridging）等
* rust——最新加入的内核rust语言重构代码，暂时未解读。
* samples——各种驱动程序示例
* scripts——构建系统的一部分，用于构建模块的脚本，Linux 内核配置器 kconfig，以及其他各种脚本（例如 checkpatch.pl，用于检查补丁（patch）是否符合 Linux 内核的编码风格）
* security——Linux 安全模块框架的位置，允许扩展默认（Unix）安全模型，以及多个此类扩展的实现，例如 SELinux、smack、apparmor 以及 tomoyo 等
* sound——ALSA（Advanced Linux Sound System，高级 Linux 声音系统）的位置，以及旧的 Linux 音频框架（OSS）
* tools——用于测试或与 Linux 内核子系统交互的各种用户空间工具
* usr——支持在内核映像中嵌入 initrd 文件
* virt——KVM（内核虚拟机）和 hypervisor（虚拟化管理程序）的位置

---

## Linux 源代码分层（Personal Ver.）

Linux源代码的核心部分在于驱动(driver)和内核(kernel)，下面分别将其分布在**硬件抽象层**和**核心层**

剩余层次主要与这两层协作，并提供更加抽象的接口封装。

#### 1. 核心层（Core Layer）

这一层包含内核的核心功能，如进程管理、内存管理、初始化等。

* **映射的目录和文件** ：
* **kernel/** ：

  * 功能：核心功能实现，包括进程管理、调度、时间管理、电源管理等。
  * 示例文件：**kernel/sched/**（调度器）、**kernel/fork.c**（进程创建）。
* **mm/** ：

  * 功能：内存管理，包括页面分配、虚拟内存、内存映射等。
  * 示例文件：**mm/page_alloc.c**（页面分配器）、**mm/vmscan.c**（页面回收）。
* **init/** ：

  * 功能：内核初始化代码，包含启动流程。
  * 示例文件：**init/main.c**（**start_kernel** 函数）。
* **ipc/** ：

  * 功能：进程间通信（IPC），如信号量、共享内存、消息队列。
  * 示例文件：**ipc/shm.c**（共享内存）。
* **block/** ：

  * 功能：块设备核心逻辑，管理块设备（如硬盘、SSD）的 I/O 操作。
  * 示例文件：**block/blk-core.c**（块设备核心）、**block/bio.c**（块 I/O 层）。
* **作用** ：

  核心层是内核的基础，负责管理 CPU、内存和基本 I/O 操作。

---

#### 2. 硬件抽象层（Hardware Abstraction Layer）

这一层负责与硬件交互，屏蔽硬件差异，包括架构相关代码和设备驱动。

* **映射的目录和文件** ：
* **arch/** ：

  * 功能：架构相关代码，支持不同 CPU 架构（如 x86、ARM、RISC-V）。
  * 示例文件：**arch/x86/kernel/**（x86 内核初始化）。
* **drivers/** ：

  * 功能：设备驱动程序，涵盖各种硬件设备。
  * 示例文件：**drivers/block/nvme.c**（NVMe 驱动）、**drivers/net/ethernet/intel/e1000/**（Intel 网卡驱动）。
* **sound/** ：

  * 功能：音频设备支持，包括声卡驱动和音频框架（如 ALSA）。
  * 示例文件：**sound/core/**（音频核心）、**sound/pci/**（PCI 声卡驱动）。
* **virt/** ：

  * 功能：虚拟化支持，包括 KVM（内核虚拟机）和虚拟化相关代码。
  * 示例文件：**virt/kvm/**（KVM 核心实现）。
* **作用** ：

  硬件抽象层让内核适配不同硬件平台，并通过驱动管理外设。

---

#### 3. 文件系统层（File System Layer）

这一层负责文件系统的管理和实现。

* **映射的目录和文件** ：
* **fs/** ：

  * 功能：文件系统实现，包括 VFS 和具体文件系统。
  * 示例文件：**fs/ext4/**（EXT4 文件系统）、**fs/proc/**（procfs）。
* **usr/** ：

  * 功能：用户空间相关文件生成（如 initramfs 映像）。
  * 示例文件：**usr/gen_init_cpio.c**（生成 initramfs 映像）。
* **作用** ：

  文件系统层将底层存储设备抽象为文件和目录，支持多种文件系统。

---

#### 4. 网络层（Networking Layer）

这一层负责网络协议栈和网络设备的管理。

* **映射的目录和文件** ：
* **net/** ：

  * 功能：网络协议栈实现，包括 TCP/IP、socket 等。
  * 示例文件：**net/ipv4/tcp.c**（TCP 协议）、**net/socket.c**（Socket 接口）。
* **io_uring/** ：

  * 功能：高性能异步 I/O 框架，支持网络和文件 I/O。
  * 示例文件：**io_uring/io_uring.c**（核心实现）。
* **作用** ：

  网络层支持网络通信，与 **drivers/net/** 中的网卡驱动协作。

---

#### 5. 系统调用接口层（System Call Interface Layer）

这一层提供用户态程序与内核交互的接口。

* **映射的目录和文件** ：
* **arch/*/entry/** （如 **arch/x86/entry/**）：

  * 功能：系统调用入口，定义用户态到内核态的切换。
  * 示例文件：**arch/x86/entry/syscall_64.c**（x86_64 系统调用处理）。
* **include/linux/syscalls.h** ：

  * 功能：系统调用声明。
* **作用** ：

  系统调用接口层是用户态与内核的桥梁。

---

#### 6. 安全与加密层（Security and Cryptography Layer）

这一层负责内核的安全机制和加密功能。

* **映射的目录和文件** ：
* **security/** ：

  * 功能：安全模块，如 SELinux、AppArmor、Smack 等。
  * 示例文件：**security/selinux/**（SELinux 实现）。
* **crypto/** ：

  * 功能：加密算法和框架，支持内核中的加密操作。
  * 示例文件：**crypto/sha256.c**（SHA-256 算法）。
* **certs/** ：

  * 功能：证书管理，用于模块签名和安全启动。
  * 示例文件：**certs/signing_key.pem**（默认签名密钥）。
* **作用** ：

  安全与加密层增强内核的安全性，支持访问控制和数据保护。

---

#### 7. 工具与支持层（Utilities and Support Layer）

这一层包含内核开发和运行所需的工具、库和文档。

* **映射的目录和文件** ：
* **lib/** ：

  * 功能：通用库函数，供内核内部使用。
  * 示例文件：**lib/string.c**（字符串操作）。
* **include/** ：

  * 功能：头文件，定义内核中使用的宏、类型和函数原型。
  * 示例文件：**include/linux/kernel.h**（核心宏定义）。
* **Documentation/** ：

  * 功能：内核文档，包含开发指南和子系统说明。
  * 示例文件：**Documentation/admin-guide/README.rst**。
* **samples/** ：

  * 功能：示例代码，展示内核模块开发。
  * 示例文件：**samples/kprobes/**（kprobes 示例）。
* **rust/** ：

  * 功能：Rust 语言支持（实验性），用于编写内核模块。
  * 示例文件：**rust/kernel/**（Rust 内核绑定）。
* **作用** ：

  工具与支持层为内核开发提供基础设施。

---

#### 8. 构建与配置层（Build and Configuration Layer）

这一层包含内核的构建系统和配置文件。

* **映射的目录和文件** ：
* **scripts/** ：

  * 功能：构建和配置脚本，用于编译内核。
  * 示例文件：**scripts/kconfig/**（**make menuconfig** 工具）。
* **tools/** ：

  * 功能：用户态工具和测试程序，与内核开发相关。
  * 示例文件：**tools/perf/**（性能分析工具 perf）。
* **Makefile** ：

  * 功能：顶层 Makefile，控制构建过程。
* **Kbuild** ：

  * 功能：构建系统核心文件。
* **Kconfig** ：

  * 功能：顶层 Kconfig 文件，定义配置选项。
* **.clang-format** ：

  * 功能：代码格式化配置文件。
* **.cocciconfig** ：

  * 功能：Coccinelle 工具配置文件，用于代码检查。
* **作用** ：

  构建与配置层负责内核的编译和定制。

---

#### 9. 文档与元数据层（Documentation and Metadata Layer）

这一层包含项目的元数据、许可证和维护信息。

* **映射的目录和文件** ：
* **LICENSES/** ：

  * 功能：许可证文件，定义内核的开源协议。
  * 示例文件：**LICENSES/preferred/GPL-2.0**（GPLv2 许可证）。
* **COPYING** ：

  * 功能：内核的许可证文件（GPLv2）。
* **CREDITS** ：

  * 功能：贡献者名单。
* **MAINTAINERS** ：

  * 功能：维护者列表，记录各模块的负责人。
* **README** ：

  * 功能：项目简介和基本说明。
* **.get_maintainer.ignore** ：

  * 功能：忽略某些维护者（用于 **get_maintainer.pl** 脚本）。
* **.gitattributes** ：

  * 功能：Git 属性配置。
* **.gitignore** ：

  * 功能：Git 忽略文件。
* **.mailmap** ：

  * 功能：邮件地址映射，用于统一贡献者身份。
* **.rustfmt.toml** ：

  * 功能：Rust 代码格式化配置。
* **作用** ：

  文档与元数据层提供项目的背景信息和开发规范。

## 根目录代码组织概览树

```bash
Linux 源代码
├── 核心层
│   ├── kernel/        # 进程、调度、时间管理
│   ├── mm/            # 内存管理
│   ├── init/          # 内核初始化
│   ├── ipc/           # 进程间通信
│   └── block/         # 块设备核心逻辑
├── 硬件抽象层
│   ├── arch/          # 架构相关代码
│   ├── drivers/       # 设备驱动
│   ├── sound/         # 音频设备支持
│   └── virt/          # 虚拟化支持
├── 文件系统层
│   ├── fs/            # 文件系统
│   └── usr/           # 用户空间文件生成
├── 网络层
│   ├── net/           # 网络协议栈
│   └── io_uring/      # 高性能异步 I/O
├── 系统调用接口层
│   ├── arch/*/entry/  # 系统调用入口
│   └── include/linux/syscalls.h  # 系统调用声明
├── 安全与加密层
│   ├── security/      # 安全模块
│   ├── crypto/        # 加密算法
│   └── certs/         # 证书管理
├── 工具与支持层
│   ├── lib/           # 通用库
│   ├── include/       # 头文件
│   ├── Documentation/ # 文档
│   ├── samples/       # 示例代码
│   └── rust/          # Rust 语言支持
├── 构建与配置层
│   ├── scripts/       # 构建脚本
│   ├── tools/         # 用户态工具
│   ├── Makefile       # 顶层构建文件
│   ├── Kbuild         # 构建系统核心
│   ├── Kconfig        # 配置选项
│   ├── .clang-format  # 代码格式化配置
│   └── .cocciconfig   # Coccinelle 配置
└── 文档与元数据层
    ├── LICENSES/      # 许可证文件
    ├── COPYING        # 许可证
    ├── CREDITS        # 贡献者名单
    ├── MAINTAINERS    # 维护者列表
    ├── README         # 项目简介
    ├── .get_maintainer.ignore  # 维护者忽略列表
    ├── .gitattributes  # Git 属性
    ├── .gitignore     # Git 忽略文件
    ├── .mailmap       # 邮件映射
    └── .rustfmt.toml  # Rust 格式化配置
```

> **阅读建议**：
>
> 1. **核心层** ：从 **init/main.c** 的 **start_kernel** 开始，逐步深入到 **kernel/sched/**（调度）和 **mm/**（内存管理）。
> 2. **硬件抽象层** ：选择一个架构（如 **arch/x86/**）或设备驱动（如 **drivers/block/nvme.c**）开始阅读。
> 3. **文件系统层** ：从 **fs/read_write.c** 入手，了解 VFS 和具体文件系统（如 **fs/ext4/**）。
> 4. **网络层** ：从 **net/socket.c** 开始，深入到 **net/ipv4/tcp.c**（TCP 协议）。
> 5. **系统调用接口层** ：查看 **arch/x86/entry/syscall_64.c**，了解系统调用流程。
> 6. **安全与加密层** ：从 **security/selinux/** 或 **crypto/sha256.c** 开始，了解安全机制。
> 7. **工具与支持层** ：阅读 **Documentation/** 中的指南，结合 **include/linux/** 的头文件理解代码。
> 8. **构建与配置层** ：从 **Makefile** 和 **scripts/kconfig/** 入手，了解构建流程。
> 9. **文档与元数据层** ：阅读 **README** 和 **MAINTAINERS**，了解项目背景和维护信息。

## 内核结构图

![img](https://linux-kernel-labs-zh.xyz/_images/Linux_kernel_architecture1.svg)
