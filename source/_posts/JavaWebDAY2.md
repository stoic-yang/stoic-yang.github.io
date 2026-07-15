---
title: "JavaWebDAY2"
date: 2024-12-21 23:13:26
updated: 2024-12-22 16:23:26
zhihu_url: "https://zhuanlan.zhihu.com/p/13945734682"
zhihu_id: "13945734682"
---
### JSON字符串与JS对象的相互转化

```js
JSON.stringify(...)：作用就是将js对象，转换为json格式的字符串。
JSON.parse(...)：作用就是将json格式的字符串，转为js对象。
```

### DOM树（原来整个网页其实一个树！）

!\[\[Pasted image 20241221192036.png\]\] - *DOM的核心思想：将网页的内容当做对象来处理，标签的所有属性在该对象上都可以找到，并且修改这个对象的属性，就会自动映射到标签身上。* - document对象 - 网页中所有内容都封装在document对象中 - 它提供的属性和方法都是用来访问和操作网页内容的，如：document.write(…) - DOM操作步骤: - 获取DOM元素对象 - 操作DOM对象的属性或方法 - 我们可以通过如下两种方式来获取DOM元素。

```text
- 根据CSS选择器来获取DOM元素，获取到匹配到的第一个元素：`document.querySelector('CSS选择器');`

- 根据CSS选择器来获取DOM元素，获取匹配到的所有元素：`document.querySelectorAll('CSS选择器');`
<body>

<h1 id="title1">11111</h1>
<h1>22222</h1>
<h1>33333</h1>

<script>
  //1. 修改第一个h1标签中的文本内容
  //1.1 获取DOM对象
  // let h1 = document.querySelector('#title1');
  //let h1 = document.querySelector('h1'); // 获取第一个h1标签

  let hs = document.querySelectorAll('h1');

  //1.2 调用DOM对象中属性或方法
  hs[2].innerHTML = '修改后的文本内容';//修改'33333'为'修改后的文本内容'
</script>
</body>
```

### JS事件监听

什么是事件呢？HTML事件是发生在HTML元素上的 “事情”，例如： - 按钮被点击 - 鼠标移到元素上 - 输入框失去焦点 - 按下键盘按键

JS事件监听的语法:

```js
事件源.addEventListener('事件类型', 要执行的函数);
```

在上述的语法中包含三个要素:

-   事件源: 哪个dom元素触发了事件, 要获取dom元素

-   事件类型: 用什么方式触发, 比如: 鼠标单击 click, 鼠标经过 mouseover

-   要执行的函数: 要做什么事


!\[\[Pasted image 20241221194342.png\]\]

### Vue

Vue（读音 /vjuː /, 类似于 view），是一款用于**构建用户界面**的**渐进式**的JavaScript**框架**

> \[!note\] reflection 像是一种更加简洁快速达到js效果的指令

[黑马文档](https://heuqqdmbyk.feishu.cn/wiki/FxTdw2K9mieDgAkhSqucg59Cn8f)

### Ajax

**Ajax:** 全称Asynchronous JavaScript And XML，异步的JavaScript和XML - 与服务器进行数据交换：通过Ajax可以给服务器发送请求，并获取服务器响应的数据。 - 异步交互：可以在**不重新加载整个页面**的情况下，与服务器交换数据并**更新部分网页**的技术，如：搜索联想、用户名是否可用的校验等等。 XML：（英语：E**x**tensible **M**arkup **L**anguage）可扩展标记语言，本质是一种数据格式，可以用来存储复杂的数据结构。

### Axios

Axios是对原生的AJAX进行封装，简化书写 引入：

```js
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

不是很理解，这一块，我先往后推再回头想一下

下面是DAY2HW3的vue与axios部分

```text
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script type="module">
  import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

  createApp({
    data() {
      return {
        searchEmp: {
          name: '',
          gender: '',
          job: ''
        },
        empList: []
      }
    },
    methods: {
      // 查询方法
      async search() {
        try {
          const response = await axios.get('https://web-server.itheima.net/emps/list', {
            params: {//- 在 Axios 中，`params` 是一个约定属性名，用于简化添加查询参数的过程，方便用于向服务器发送数据。
              name: this.searchEmp.name,//获取数据指定为URL查询参数
              gender: this.searchEmp.gender,
              job: this.searchEmp.job
            }
          });
          this.empList = response.data.data;
        } catch (error) {
          console.error('获取员工数据失败:', error);
        }
      },
      // 清空方法
      clear() {
        // 清空搜索条件
        this.searchEmp = {
          name: '',
          gender: '',
          job: ''
        };
        // 重新查询所有数据
        this.search();
      }
    },
    // 页面加载时获取所有员工数据
    mounted() {
      this.search();
    }
  }).mount('#container')
</script>
```

代码起码还是得自己敲一遍，不然会想不明白，或者以为自己懂了
