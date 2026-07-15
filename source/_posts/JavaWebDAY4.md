---
title: "JavaWebDAY4"
date: 2024-12-24 09:58:33
updated: 2024-12-24 09:58:33
zhihu_url: "https://zhuanlan.zhihu.com/p/14314843419"
zhihu_id: "14314843419"
---
### HTTP

**HTTP**：Hyper Text Transfer Protocol(超文本传输协议)，规定了浏览器与服务器之间数据传输的规则。 - **GET方式的请求协议：** - **请求行**(以上图中红色部分) ：HTTP请求中的第一行数据。由：`请求方式`、`资源路径`、`协议/版本`组成（之间使用空格分隔） - 请求方式：GET - 资源路径：/brand/findAll?name=OPPO&status=1 - 请求路径：/brand/findAll - 请求参数：name=OPPO&status=1 - 请求参数是以key=value形式出现 - 多个请求参数之间使用`&`连接 - 请求路径和请求参数之间使用`?`连接 - 协议/版本：HTTP/1.1 - 常见的HTTP请求头有:

|  |  |
| --- | --- |
| 请求头 | 含义 |
| Host | 表示请求的主机名 |
| User-Agent | 浏览器版本。 例如：Chrome浏览器的标识类似Mozilla/5.0 ...Chrome/79 ，IE浏览器的标识类似Mozilla/5.0 (Windows NT ...)like Gecko |
| Accept | 表示浏览器能接收的资源类型，如text/，image/或者/表示所有； |
| Accept-Language | 表示浏览器偏好的语言，服务器可以据此返回不同语言的网页； |
| Accept-Encoding | 表示浏览器可以支持的压缩类型，例如gzip, deflate等。 |
| Content-Type | 请求主体的数据类型 |
| Content-Length | 数据主体的大小（单位：字节） |

> 举例说明：服务端可以根据请求头中的内容来获取客户端的相关信息，有了这些信息服务端就可以处理不同的业务需求。 比如: - 不同浏览器解析HTML和CSS标签的结果会有不一致，所以就会导致相同的代码在不同的浏览器会出现不同的效果

-   服务端根据客户端请求头中的数据获取到客户端的浏览器类型，就可以根据不同的浏览器设置不同的代码来达到一致的效果（这就是我们常说的浏览器兼容问题）



### SpringbootWeb实例分析

### 源代码

```java
package com.itheima.controller;
import cn.hutool.core.io.IoUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import com.itheima.pojo.User;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class UserController {

    @RequestMapping("/list")
    public String list(){
        //1.加载并读取文件
        InputStream in = this.getClass().getClassLoader().getResourceAsStream("user.txt");
        ArrayList<String> lines = IoUtil.readLines(in, StandardCharsets.UTF_8, new ArrayList<>());

        //2.解析数据，封装成对象 --> 集合
        List<User> userList = lines.stream().map(line -> {
            String[] parts = line.split(",");
            Integer id = Integer.parseInt(parts[0]);
            String username = parts[1];
            String password = parts[2];
            String name = parts[3];
            Integer age = Integer.parseInt(parts[4]);
            LocalDateTime updateTime = LocalDateTime.parse(parts[5], DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            return new User(id, username, password, name, age, updateTime);
        }).collect(Collectors.toList());

        //3.响应数据
        return JSONUtil.toJsonStr(userList, JSONConfig.create().setDateFormat("yyyy-MM-dd HH:mm:ss"));
    }
}
```

### 加载和读取文件

```java
InputStream in = this.getClass().getClassLoader().getResourceAsStream("user.txt");
        ArrayList<String> lines = IoUtil.readLines(in, StandardCharsets.UTF_8, new ArrayList<>());
// 步骤1：获取当前类的 Class 对象
this.getClass()
// 步骤2：获取类加载器 ClassLoader
.getClassLoader()
// 步骤3：使用类加载器加载资源文件，返回 InputStream
.getResourceAsStream("user.txt")
// 步骤4：使用 Hutool 工具类 IoUtil 读取内容
ArrayList<String> lines = IoUtil.readLines(in, StandardCharsets.UTF_8, new ArrayList<>());
```

-   ClassLoader 的资源加载机制会从以下位置查找资源：

1.  项目的 classpath 根目录
2.  项目依赖的 JAR 包中

-   当找到文件时，返回对应的 InputStream
-   如果找不到文件，则返回 null

-   文件必须放在 resources 目录下

-   文件路径是相对于 classpath 的根路径
-   如果文件在子目录中，需要加上目录路径，如：`"data/user.txt"`

-   `IoUtil.readLines()` 方法用于按行读取文件内容

-   参数说明：

-   `in`：输入流
-   `StandardCharsets.UTF_8`：字符编码
-   `new ArrayList<>()`：存储读取结果的集合

### steam流

**Stream 操作的特点** - `stream()`: 创建一个流，允许对数据进行链式操作 - `map()`: 转换操作，将一种类型转换为另一种类型 - 输入：String（一行文本） - 输出：User对象 - `collect()`: 收集操作，将流中的元素收集到一个新的集合中 **为什么使用Stream API** - 代码更简洁、更易读 - 支持并行处理（可以通过 `parallelStream()` 实现） - 声明式编程，关注"做什么"而不是"怎么做" - 减少了显式的循环控制

```java
lines.stream()  // 1. 从ArrayList<String>创建流
     .map(line -> {  // 2. 对每一行数据进行转换
         // 转换逻辑
     })
     .collect(Collectors.toList())  // 3. 收集结果到List
```

详细执行步骤：

```java
// 假设 lines 包含以下数据：
// "1,zhangsan,123456,张三,18,2024-01-01 12:00:00"
// "2,lisi,654321,李四,20,2024-01-02 13:00:00"
lines.stream().map(line -> {
    // 对每一行(line)执行：

    // 1. 分割字符串
    String[] parts = line.split(",");
    // parts[0] = "1"
    // parts[1] = "zhangsan"
    // 以此类推...

    // 2. 转换数据类型
    Integer id = Integer.parseInt(parts[0]);  // "1" -> 1
    String username = parts[1];               // "zhangsan"
    String password = parts[2];               // "123456"
    String name = parts[3];                   // "张三"
    Integer age = Integer.parseInt(parts[4]); // "18" -> 18

    // 3. 解析日期时间
    LocalDateTime updateTime = LocalDateTime.parse(
        parts[5],  // "2024-01-01 12:00:00"
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
    );

    // 4. 创建并返回新的User对象
    return new User(id, username, password, name, age, updateTime);
})
```

### Stream流的基本使用 （我之前真的没有用过， ）

### 创建stream流

```java
// 1. 从集合创建
List<String> list = Arrays.asList("Java", "Python", "C++");
Stream<String> stream1 = list.stream();

// 2. 从数组创建
String[] array = {"Java", "Python", "C++"};
Stream<String> stream2 = Arrays.stream(array);

// 3. 直接创建
Stream<String> stream3 = Stream.of("Java", "Python", "C++");

// 4. 创建无限流
Stream<Integer> infiniteStream = Stream.iterate(1, n -> n + 1); // 1,2,3,4...
```

### stream的基本操作

```java
//filter 过滤
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // 获取偶数
        List<Integer> evenNumbers = numbers.stream()
            .filter(n -> n % 2 == 0)    // 过滤条件
            .collect(Collectors.toList()); // [2, 4, 6, 8, 10]

        // 获取长度大于3的单词
        List<String> words = Arrays.asList("Java", "Python", "C++", "JavaScript");
        List<String> longWords = words.stream()
            .filter(word -> word.length() > 3)
            .collect(Collectors.toList()); // [Java, Python, JavaScript]

        //map 转换
        // 将数字转换为平方
        List<Integer> numbers2 = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> squares = numbers2.stream()
            .map(n -> n * n)
            .collect(Collectors.toList()); // [1, 4, 9, 16, 25]

        // 将字符串转换为大写
        List<String> words2 = Arrays.asList("java", "python", "c++");
        List<String> upperWords = words2.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList()); // [JAVA, PYTHON, C++]

        //sort 排序
        // 数字排序
        List<Integer> numbers3 = Arrays.asList(3, 1, 4, 1, 5, 9);
        List<Integer> sorted = numbers3.stream()
            .sorted()
            .collect(Collectors.toList()); // [1, 1, 3, 4, 5, 9]

        // 自定义排序
        List<String> words3 = Arrays.asList("Java", "Python", "C++");
        List<String> sortedByLength = words3.stream()
            .sorted((a, b) -> a.length() - b.length()) //箭头前是传入的参数，后面是传入的函数
            .collect(Collectors.toList()); // [C++, Java, Python]

        //distinct 去重
        List<Integer> numbers4 = Arrays.asList(1, 2, 2, 3, 3, 4);
        List<Integer> distinct = numbers4.stream()
            .distinct()
            .collect(Collectors.toList()); // [1, 2, 3, 4]
```

> \[!note\] 插入感想 好神奇的一种用法，跟我以前见过代码风格不一样，这个体现在用->, 以及这个'.'还要换行，真的是闻所未闻

### @ResponseBody注解：

-   类型：方法注解、类注解
-   位置：书写在Controller方法上或类上
-   作用：将方法返回值直接响应给浏览器，如果返回值类型是实体对象/集合，将会转换为JSON格式后在响应给浏览器

但是在我们所书写的Controller中，只在类上添加了@RestController注解、方法添加了@RequestMapping注解，并没有使用@ResponseBody注解，怎么给浏览器响应呢？

这是因为，我们在类上加了@RestController注解，而这个注解是由两个注解组合起来的，分别是：@Controller 、@ResponseBody。 那也就意味着，我们在类上已经添加了@ResponseBody注解了，而一旦在类上加了@ResponseBody注解，就相当于该类所有的方法中都已经添加了@ResponseBody注解。

> 提示：前后端分离的项目中，一般直接在请求处理类上加@RestController注解，就无需在方法上加@ResponseBody注解了。

### 分成解耦（软件工程的思想：降低复杂度）

其实我们上述案例的处理逻辑呢，从组成上看可以分为三个部分： - 数据访问：负责业务数据的维护操作，包括增、删、改、查等操作。 - 逻辑处理：负责业务逻辑处理的代码。 - 请求处理、响应数据：负责，接收页面的请求，给页面响应数据。

按照上述的三个组成部分，在我们项目开发中呢，可以将代码分为三层，如图所示： （图片加载失败了QAQ）

\- Controller：控制层。接收前端发送的请求，对请求进行处理，并响应数据。 - Service：业务逻辑层。处理具体的业务逻辑。 - Dao：数据访问层(Data Access Object)，也称为持久层。负责数据访问操作，包括数据的增、删、改、查。 基于三层架构的程序执行流程，如图所示： （图片加载失败了QAQ）



### 代码拆分

-   控制层包名：`com.itheima.controller`
-   业务逻辑层包名：`com.itheima.service`
-   数据访问层包名：`com.itheima.dao`

### 内聚和耦合

-   **内聚：**软件中各个功能模块内部的功能联系。
-   **耦合：**衡量软件中各个层/模块之间的依赖、关联的程度。

**软件设计原则：高内聚低耦合。**

> **高内聚：**指的是一个模块中各个元素之间的联系的紧密程度，如果各个元素(语句、程序段)之间的联系程度越高，则内聚性越高，即 "高内聚"。 **低耦合：**指的是软件中各个层、模块之间的依赖关联程序越低越好。

### IOC &DI

之前我们在编写代码时，需要什么对象，就直接new一个就可以了。这种做法呢，层与层之间代码就耦合了，当service层的实现变了之后，我们还需要修改controller层的代码。

我们的解决思路是： - 提供一个容器，容器中存储一些对象(例：UserService对象) - Controller程序从容器中获取UserService类型的对象

-   **控制反转：** Inversion Of Control，简称**IOC**。对象的创建控制权由程序自身转移到外部（容器），这种思想称为控制反转。


-   对象的创建权由程序员主动创建转移到容器(由容器创建、管理对象)。这个容器称为：IOC容器或Spring容器。


-   **依赖注入：** Dependency Injection，简称**DI**。容器为应用程序提供运行时，所依赖的资源，称之为依赖注入。


-   程序运行时需要某个资源，此时容器就为其提供这个资源。

-   例：EmpController程序运行时需要EmpService对象，Spring容器就为其提供并注入EmpService对象。


-   bean对象：IOC容器中创建、管理的对象，称之为：bean对象。


### 声明

在实现类加上 `@Component` 注解，就代表把当前类产生的对象交给IOC容器管理。

```java
@Component
public class UserDaoImpl implements UserDao {
    @Override
    public List<String> findAll() {
        InputStream in = this.getClass().getClassLoader().getResourceAsStream("user.txt");
        ArrayList<String> lines = IoUtil.readLines(in, StandardCharsets.UTF_8, new ArrayList<>());
        return lines;
    }
}
```

**Controller 及 Service注入运行时所依赖的对象**

```java
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @RequestMapping("/list")
    public List<User> list(){
        //1.调用Service
        List<User> userList = userService.findAll();
        //2.响应数据
        return userList;
    }

}
```

### Bean声明

|  |  |  |
| --- | --- | --- |
| 注解 | 说明 | 位置 |
| @Component | 声明bean的基础注解 | 不属于以下三类时，用此注解 |
| @Controller | @Component的衍生注解 | 标注在控制层类上 |
| @Service | @Component的衍生注解 | 标注在业务层类上 |
| @Repository | @Component的衍生注解 | 标注在数据访问层类上（由于与mybatis整合，用的少） |
| 注意1：声明bean的时候，可以通过注解的value属性指定bean的名字，如果没有指定，默认为类名首字母小写。 |  |  |

**注意2**：使用以上四个注解都可以声明bean，但是在springboot集成web开发中，声明控制器bean只能用@Controller。

### 组件扫描

-   前面声明bean的四大注解，要想生效，还需要被组件扫描注解 `@ComponentScan` 扫描。

-   该注解虽然没有显式配置，但是实际上已经包含在了启动类声明注解 `@SpringBootApplication` 中，默认扫描的范围是启动类所在包及其子包。




![](14314843419-01.jpg)

保持上面这个结构就不会有组件扫描失败的问题了

### @Autowired的用法

属性注入（简洁、常用）

```java
@RestController
public class UserController {

    //方式一: 属性注入
    @Autowired
    private UserService userService;

  }
```

构造函数注入（常用）

```java
@RestController
public class UserController {

    //方式二: 构造器注入
    private final UserService userService;

    @Autowired //如果当前类中只存在一个构造函数, @Autowired可以省略
    public UserController(UserService userService) {
        this.userService = userService;
    }

 }
```

setter注入（不常用）

```java
/**
 * 用户信息Controller
 */
@RestController
public class UserController {

    //方式三: setter注入
    private UserService userService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

}
```

### 多个bean对象的处理

-   @Primary
-   @Qualifier
-   @Resource

**方案一：使用@Primary注解**（优先选取） 当存在多个相同类型的Bean注入时，加上@Primary注解，来确定默认的实现。

```java
@Primary
@Service
public class UserServiceImpl implements UserService {
}
```

**方案二：使用@Qualifier注解**（指定名字） 指定当前要注入的bean对象。 在@Qualifier的value属性中，指定注入的bean的名称。 @Qualifier注解不能单独使用，必须配合@Autowired使用。

```java
@RestController
public class UserController {

    @Qualifier("userServiceImpl")
    @Autowired
    private UserService userService;
```

**方案三：使用@Resource注解**（指定名字） 是按照bean的名称进行注入。通过name属性指定要注入的bean的名称。

```java
@RestController
public class UserController {

    @Resource(name = "userServiceImpl")
    private UserService userService;
```

面试题：@Autowird 与 @Resource的区别 - @Autowired 是spring框架提供的注解，而@Resource是JDK提供的注解 - @Autowired 默认是按照***类型注入***，而@Resource是按照***名称注入***

### 常见的状态码

|  |  |  |
| --- | --- | --- |
| 状态码 | 英文描述 | 解释 |
| 200 | OK | 客户端请求成功，即处理成功，这是我们最想看到的状态码 |
| 302 | Found | 指示所请求的资源已移动到由Location响应头给定的 URL，浏览器会自动重新访问到这个页面 |
| 304 | Not Modified | 告诉客户端，你请求的资源至上次取得后，服务端并未更改，你直接用你本地缓存吧。隐式重定向 |
| 400 | Bad Request | 客户端请求有语法错误，不能被服务器所理解 |
| 403 | Forbidden | 服务器收到请求，但是拒绝提供服务，比如：没有权限访问相关资源 |
| 404 | Not Found | 请求资源不存在，一般是URL输入有误，或者网站资源被删除了 |
| 405 | Method Not Allowed | 请求方式有误，比如应该用GET请求方式的资源，用了POST |
| 428 | Precondition Required | 服务器要求有条件的请求，告诉客户端要想访问该资源，必须携带特定的请求头 |
| 429 | Too Many Requests | 指示用户在给定时间内发送了太多请求（“限速”），配合 Retry-After(多长时间后可以请求)响应头一起使用 |
| 431 | Request Header Fields Too Large | 请求头太大，服务器不愿意处理请求，因为它的头部字段太大。请求可以在减少请求头域的大小后重新提交。 |
| 500 | Internal Server Error | 服务器发生不可预期的错误。服务器出异常了，赶紧看日志去吧 |
| 503 | Service Unavailable | 服务器尚未准备好处理请求，服务器刚刚启动，还未初始化好 |
