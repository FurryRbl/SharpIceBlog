---
title: 尝试出一些比小米BL解锁答题还离谱的题目
date: 4/1/2024 21:30:00
description: 一些可能比小米BL解锁答题还离谱的题目
keywords: Android,小米,小米BL解锁答题,小米社区BL几所答题,BL解锁,BootLoader解锁
tags: Android
categories: Android
---

## 题目

### 1. system.transfer.list 和 system.new.dat.br 相关 [^1]

A. system.transfer.list 和 system.new.dat.br 的出现是为了增加刷机的复杂度。

B. system.transfer.list 和 system.new.dat.br 的出现是为了缩小刷机包大小及加快系统更新速度。

C. 后缀 .br 是 Brotli 压缩算法。

D. system.transfer.list 只有四个版本（2020）

E. system.transfer.list 第一行表示 system.transfer.list 的版本

F. system.transfer.list 第二行表示总共需要写入的 block 数量

### 2. 刷机相关 [^2]

**回答题**

1. 5%模式是哪个厂商的手机独有的

2. 挖煤模式是哪个厂商的手机独有的

**选择题**

A. 刷机包能提供可视化的操作界面

B. Userdata 分区加密是整个分区都进行加密的

### 系统相关 [^3]

**回答题**

1. Android 将什么 Property 设置为什么可以完全禁用开机第二屏动画

**选择题**

A. 微内核适合嵌入式设备

B. Android 在完全开机进入系统后无法再次播放开机第二屏动画

## 答案及解析

[^1]: 正确答案：B、C、D、E、F
[^2]: 填空题：

    1. 华为和荣耀
    2. 三星

    选择题：A（如果 Userdata 整个分区都是加密的就意味着在 Android 开机中就需要输入密码，因此 Android 只加密用户数据）

[^3]: 填空题：

    1. 将 debug.sf.nobootanimation 设置为非0的整数

    选择题：A

    选择题解析：
    B. 是可以的，只需要在权限足够的情况下运行`/system/bin/bootanimation`即可
