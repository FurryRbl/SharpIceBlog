---
title: 记一次Android获取特定包下的所有类
date: 4/19/2024 21:10:00
description: 记一次Android获取特定包下的所有类
keywords: Android,Java,Android 开发,Android App,Android App开发
tags: Android
categories: Android
---

<!-- markdownlint-disable MD036 -->

**Tips: 使用这个方法必须关闭Android Studio的部署优化（Always install with package manager(disable deploy optimizations on Android11 and later)），否者请使用Gralde命令手动编译安装**

## 代码

```Java utils.java
package com.sharpice.test;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

/**
 * @author SharpIce
 */
public class utils {
    public static List<String> searchClass(Context context, String packageName) throws PackageManager.NameNotFoundException, IOException {
        List<String> classList = new ArrayList<>();

        // 包名结尾必须要添加 "."
        if (!packageName.endsWith(".")) {
            packageName += ".";
        }

        ApplicationInfo applicationInfo = context.getPackageManager().getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA); // 获取当前应用的 ApplicationInfo
        String apkPath = applicationInfo.sourceDir; // 得到 APK 位置
        dalvik.system.DexFile df = new dalvik.system.DexFile(apkPath);
        Enumeration<String> enumeration = df.entries(); // 获取 Dex 中的所有类名

        // 遍历得到需要的类名
        while (enumeration.hasMoreElements()) {
            String className = enumeration.nextElement();
            if (className.startsWith(packageName) && !className.contains("$")) {
                classList.add(className);
            }
        }

        return classList;
    }
}
```
