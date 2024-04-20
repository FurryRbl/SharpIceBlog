---
title: 记一次使用.NET Core的AOT特性编写带DllMain的Windows动态链接库
date: 4/19/2024 21:10:00
description: 一个使用.NET Core的AOT特性编写带DllMain的Windows动态链接库的笔记
keywords: C#,.NET,.NET Core,.NET Core AOT,AOT,,C# 8.0,Windows
tags: Windows
categories: C#
---

## 项目配置

```xml Project.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>    <!-- 指定目标框架为.NET 8.0 -->
    <ImplicitUsings>enable</ImplicitUsings>    <!-- 启用隐式引用 -->
    <Nullable>enable</Nullable>    <!-- 启用可空引用类型 -->
    <AllowUnsafeBlocks>True</AllowUnsafeBlocks>    <!-- 允许使用不安全的代码块 -->
    <PublishAot>true</PublishAot>    <!-- 启用发布使用 AOT 编译 -->
  </PropertyGroup>
</Project>
```

## 入口点

**Tips: 入口可以是随意文件、类和方法名，但是"EntryPoint"必须设置为"DllMain"**

```csharp Program.cs
using System.Runtime.InteropServices;

namespace Test // 可选命名空间
{
    public static partial class Program
    {
        [UnmanagedCallersOnly(EntryPoint = "DllMain")]
#pragma warning disable IDE0060
        public static bool DllMain(IntPtr hModule, uint ul_reason_for_call, IntPtr lpReserved)
#pragma warning restore IDE0060
        {
            switch (ul_reason_for_call)
            {
                case 1: // DLL_PROCESS_ATTACH DLL 被加载
                    break;

                case 0: // DLL_PROCESS_DETACH DLL 被卸载
                    break;

                case 2: // DLL_THREAD_ATTACH 线程已附加到 DLL 中
                    break;

                case 3: // DLL_THREAD_DETACH 线程已从 DLL 中分离
                    break;

            }
            return true;
        }
    }
}
```

## 发布文件

```xml Properties/PublishProfiles/publish.pubxml
<?xml version="1.0" encoding="utf-8"?>
<Project>
  <PropertyGroup>
    <Configuration>Debug</Configuration>    <!-- 编译配置，可以是Debug也可以是Rlease或者其他 -->
    <Platform>Any CPU</Platform>    <!-- 平台目标 -->
    <PublishDir>bin\publish</PublishDir>    <!-- 发布目录 -->
    <PublishProtocol>FileSystem</PublishProtocol>    <!-- 发布方式 -->
    <_TargetId>Folder</_TargetId>    <!-- 目标标识符 -->
    <TargetFramework>net8.0</TargetFramework>    <!-- 目标框架 -->
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>    <!-- 运行时标识 -->
    <SelfContained>false</SelfContained>    <!-- 应用是否独立，必须为false否者会出现未知问题无法完成发布 -->
    <PublishSingleFile>false</PublishSingleFile>    <!-- 是否发布为单个文件，必须为false否者会出现未知问题无法完成发布 -->
    <PublishReadyToRun>true</PublishReadyToRun>    <!-- 是否发布为ReadyToRun -->
  </PropertyGroup>
</Project>
```
