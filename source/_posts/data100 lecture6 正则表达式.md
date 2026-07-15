---
title: "data100 lecture6 正则表达式"
date: 2025-02-04 11:27:46
updated: 2025-02-04 11:27:46
zhihu_url: "https://zhuanlan.zhihu.com/p/21223302552"
zhihu_id: "21223302552"
math: true
---
lab01

[q2](pycharm://C:\Users\zzy\Documents\Code\data100\lab\lab01\lab01.ipynb?line=197) py的基础知识：指数计算用\*\*

```python
total = x**2 + x**3
```

$total = x^2 + x^3$

用np的数组相加，对应序号的数相加，然后输出一个新的数组 q3a $$

$$f'(x) = 2x $$f'(x)|\_{x=0}=0 $$

### latex

$\sigma(-x)=1-\sigma(x)$ $\frac{d}{dx}\sigma(x)=\sigma(x)(1-\sigma(x))$

### lecture6 Regex（正则表达式）

正则表达式是由解决复杂的切割字符串的需求引出的

用py基本的语法切割，这个看起来也确实是吓人

```python
pertinent = first.split("[")[1].split(']')[0]
day, month, rest = pertinent.split('/')
year, hour, minute, rest = rest.split(':')
seconds, time_zone = rest.split(' ')
```

### 引入正则表达式的库

```python
import re
```

!\[\[Pasted image 20250203170624.webp\]\]

closure: 以 \* 后面的在结尾处出现零次或多次 group: 括号内的组出现零次或多次

`点" . "`: 任意字符（0 次|多次） !\[\[Pasted image 20250204102000.webp\]\]

`字符范围[A-Za-z]`: 任意一个大小写字符 !\[\[Pasted image 20250204102852.webp\]\]

`重复{ n }`: 前面的部分重复n次, 可以有多个数，用逗号分隔，{ n , m }表示重复 n 或者 m 次

`+`：至少一次

`?`：0 次或者 1 次

!\[\[Pasted image 20250204103546.webp\]\]

> \[!note\] question? Give a regular expression for any lowercase string that has are repeated vowel (noon, peel, festoon, looop, etc).

```text
[a-z]+[a-z]*([aoeui]{2})+[a-z]* (x)

[a-z]+(aa|ee|ii|oo|uu)[a-z]+
```

`[a-z]` 本身带有重复的属性，不需要再加上\*

### `(aa|ee|ii|oo|uu)` 与 `[aoeui]{2}`

1.  `[aoeui]{2}`：


-   `[aoeui]` 表示匹配其中任意一个字符（a、o、e、u、i）
-   `{2}` 表示重复两次
-   这意味着它可以匹配：

-   "aa", "ao", "ae", "au", "ai"
-   "oa", "oo", "oe", "ou", "oi"
-   "ea", "eo", "ee", "eu", "ei"
-   "ua", "uo", "ue", "uu", "ui"
-   "ia", "io", "ie", "iu", "ii"



-   总共可以匹配 5 × 5 = 25 种不同的组合
-   `(aa|ee|ii|oo|uu)`：

-   这个表达式使用 `|` 分隔不同的选项

-   只能匹配以下 5 种组合：

-   "aa"
-   "ee"
-   "ii"
-   "oo"
-   "uu"

主要区别：

-   `[aoeui]{2}` 允许两个字符可以不同，只要都是列表中的字符即可
-   `(aa|ee|ii|oo|uu)` 只匹配相同字符的重复
-   前者能匹配 25 种组合，后者只能匹配 5 种组合

如果要让它们等价，需要修改为：

-   `[aoeui]{2}` 改为 `([aeiou])\1`
-   其中 `\1` 表示引用第一个捕获组，确保第二个字符和第一个字符相同

### 字符 `^`：

`^` 符号在正则表达式中表示"行的开始"或"字符串的开始"。它是一个位置标记（anchor），用来匹配文本的起始位置。

让我通过几个例子来说明：

1.  `^abc`


-   匹配：以 "abc" 开头的字符串
-   会匹配："abc", "abcdef"
-   不会匹配："xabc", "123abc"
-   `^[A-Z]`

-   匹配：以大写字母开头的字符串

-   会匹配："Apple", "Book"
-   不会匹配："apple", "1Book"

需要注意的是：

-   `^` 只有在位于正则表达式开头时才表示"行首"
-   如果 `^` 出现在 `[]` 字符集中（例如 `[^abc]`），则表示"取反"的意思，意思是匹配除了这些字符以外的任何字符

```text
/^test/    // 匹配以 "test" 开头的字符串
/[^abc]/   // 匹配除了 a、b、c 以外的任何字符
/^test$/   // 只匹配完全等于 "test" 的字符串
/^A.*Z$/   // 匹配以 A 开头，以 Z 结尾的字符串
```

在多行模式（multiline mode）下，`^` 会匹配每一行的开始，而不仅仅是整个字符串的开始。

### `+` 的优先级：

`+` 是一个量词（quantifier），它的优先级低于圆括号 `()`。也就是说，`+` 会作用于其左侧最近的元素或分组。

`$` 以什么结尾 !\[\[Pasted image 20250204111117.webp\]\]
