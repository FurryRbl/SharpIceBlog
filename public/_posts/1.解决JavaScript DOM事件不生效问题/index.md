---
title: 解决JavaScript DOM事件不生效问题
date: 2/26/2024 17:30:00
description: 解决前端通过async引入的JavaScript DOM事件不生效问题
keywords: 前端,JavaScript,DOM
tags: 前端
categories: 前端
---

## 问题代码

```html index.html
<html>
  <head>
    <script src="/main.js" async></script>
  </head>
</html>
```

```javascript main.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('Hello World！');
});
```

## 解决思路

问题就出在引入main.js使用了async导致HTML解析和JavaScript运行同时执行。

解决办法也很简单，首先JavaScript有一个`document.readyState`的属性用来获取加载状态，其中属性可以为：

```plaintext
loading（正在加载）

interactive（可交互）

complete（完成）
```

其中 如果已经是非`loading`状态了，那么在去添加DOM完成事件肯定就不会执行完成后的操作了。

顾解决办法如下：

```javascript main.js
const initialize = () => {
  console.log('Hello World！');
};

if (document.readyState !== 'loading') {
  initialize();
} else {
  document.addEventListener('DOMContentLoaded', initialize);
}
```
