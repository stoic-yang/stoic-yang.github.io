---
title: "JavaWebDAY3"
date: 2024-12-22 17:13:20
updated: 2024-12-22 17:13:20
zhihu_url: "https://zhuanlan.zhihu.com/p/14017924225"
zhihu_id: "14017924225"
---
### Maven

### Maven就是一款管理和构建java项目的工具。

maven项目的目录结构中，main目录下存放的是项目的源代码，test目录下存放的是项目的测试代码。而无论是在main还是在test下，都有两个目录，一个是java，用来存放源代码文件；另一个是resources，用来存放配置文件。

### Maven的作用 ：

1.  方便的依赖管理
2.  统一的项目结构
3.  标准的项目构建流程

写61b的时候用过，当时不知道啥原理，现在明白了 maven就是拿来管理jar包和规范项目结构的 !\[\[Pasted image 20241222164101.png\]\]

### pom文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <!-- POM模型版本 -->
    <modelVersion>4.0.0</modelVersion>

    <!-- 当前项目坐标 -->
    <groupId>com.itheima</groupId>
    <artifactId>maven-project01</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!-- 项目的JDK版本及编码 -->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

-   `<project>` ：pom文件的根标签，表示当前maven项目
-   `<modelVersion>`：声明项目描述遵循哪一个POM模型版本
-   坐标 ：

-   `<groupId>` `<artifactId>` `<version>`
-   定位项目在本地仓库中的位置，由以上三个标签组成一个坐标


-   `<maven.compiler.source>` ：编译JDK的版本
-   `<maven.compiler.target>` ：运行JDK的版本
-   `<project.build.sourceEncoding>` : 设置项目的字符集

### 导入maven

-   方式一：`File` -> `Project Structure` -> `Modules` -> `Import Module` -> `选择maven项目的pom.xml`。 !\[\[Pasted image 20241222164751.png\]\]
-   方式二：`Maven面板` -> `+（Add Maven Projects）` -> `选择maven项目的pom.xml`。 !\[\[Pasted image 20241222164813.png\]\]

### 依赖配置

```xml
<dependencies>
    <!-- 依赖 : spring-context -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.1.4</version>
    </dependency>
</dependencies>
```

### 依赖传递

所谓maven的依赖传递，指的就是如果在maven项目中，A 依赖了B，B依赖了C，C依赖了D，那么在A项目中，也会有C、D依赖，因为依赖会传递。

### 排除依赖

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.1.4</version>

    <!--排除依赖, 主动断开依赖的资源-->
    <exclusions>
        <exclusion>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-observation</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 生命周期

Maven的生命周期就是为了对所有的构建过程进行抽象和统一。描述了一次项目构建，经历哪些阶段。 Maven对项目构建的生命周期划分为3套（相互独立）：

![](14017924225-01.png)

\- clean：清理工作。 - default：核心工作。如：编译、测试、打包、安装、部署等。 - site：生成报告、发布站点等。 三套生命周期又包含哪些具体的阶段呢, 我们来看下面这幅图:

![](14017924225-02.jpg)

主要关注以下几个： - clean：移除上一次构建生成的文件 - compile：编译项目源代码 - test：使用合适的单元测试框架运行测试(junit) - package：将编译后的文件打包，如：jar、war等 - install：安装项目到本地仓库

### 执行

在日常开发中，当我们要执行指定的生命周期时，有两种执行方式： 1. 在idea工具右侧的maven工具栏中，选择对应的生命周期，双击执行 2. 在DOS命令行中，通过maven命令执行 **方式一：在idea中执行生命周期** - 选择对应的生命周期，双击执行

![](14017924225-03.jpg)

其他的生命周期都是类似的道理，双击运行即可。 **方式二：在命令行中执行生命周期** 1. 打开maven项目对应的磁盘目录

![](14017924225-04.jpg)

2\. 在当前目录下打开CMD

![](14017924225-05.jpg)



类似的道理，我们也可以在命令执行： - mvn compile - mvn test - mvn package - mvn install

### 单元测试

\*\*测试：是一种用来促进鉴定软件的正确性、完整性、安全性和质量的过程。 阶段划分：单元测试、集成测试、系统测试、验收测试。

![](14017924225-06.jpg)



1). 单元测试 - 介绍：对软件的基本组成单位进行测试，最小测试单位。 - 目的：检验软件基本组成单位的正确性。 - 测试人员：开发人员 2). 集成测试 - 介绍：将已分别通过测试的单元，按设计要求组合成系统或子系统，再进行的测试。 - 目的：检查单元之间的协作是否正确。 - 测试人员：开发人员 3). 系统测试 - 介绍：对已经集成好的软件系统进行彻底的测试。 - 目的：验证软件系统的正确性、性能是否满足指定的要求。 - 测试人员：测试人员 4). 验收测试 - 介绍：交付测试，是针对用户需求、业务流程进行的正式的测试。 - 目的：验证软件系统是否满足验收标准。 - 测试人员：客户/需求方 测试方法：白盒测试、黑盒测试 及 灰盒测试。

![](14017924225-07.jpg)

1). 白盒测试 清楚软件内部结构、代码逻辑。 用于验证代码、逻辑正确性。 2). 黑盒测试 不清楚软件内部结构、代码逻辑。 用于验证软件的功能、兼容性、验收测试等方面。 3). 灰盒测试 结合了白盒测试和黑盒测试的特点，既关注软件的内部结构又考虑外部表现（功能）。

![](14017924225-08.jpg)



### Junit

之前在 61b用过，可以补充几个知识点

### 断言

| 断言方法 | 描述 |
| --- | --- |
| assertEquals(Object exp, Object act, String msg) | 检查两个值是否相等，不相等就报错。 |
| assertNotEquals(Object unexp, Object act, String msg) | 检查两个值是否不相等，相等就报错。 |
| assertNull(Object act, String msg) | 检查对象是否为null，不为null，就报错。 |
| assertNotNull(Object act, String msg) | 检查对象是否不为null，为null，就报错。 |
| assertTrue(boolean condition, String msg) | 检查条件是否为true，不为true，就报错。 |
| assertFalse(boolean condition, String msg) | 检查条件是否为false，不为false，就报错。 |
| assertSame(Object exp, Object act, String msg) | 检查两个对象引用是否相等，不相等，就报错。 |

示例演示：

```java
package com.itheima;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

public class UserServiceTest {

    @Test
    public void testGetAge2(){
        Integer age = new UserService().getAge("110002200505091218");
        Assertions.assertNotEquals(18, age, "两个值相等");
//        String s1 = new String("Hello");
//        String s2 = "Hello";
//        Assertions.assertSame(s1, s2, "不是同一个对象引用");
    }

    @Test
    public void testGetGender2(){
        String gender = new UserService().getGender("612429198904201611");
        Assertions.assertEquals("男", gender);
    }
}
```

### 常见注解

在JUnit中还提供了一些注解，还增强其功能，常见的注解有以下几个：

|  |  |  |
| --- | --- | --- |
| 注解 | 说明 | 备注 |
| @Test | 测试类中的方法用它修饰才能成为测试方法，才能启动执行 | 单元测试 |
| @BeforeEach | 用来修饰一个实例方法，该方法会在每一个测试方法执行之前执行一次。 | 初始化资源(准备工作) |
| @AfterEach | 用来修饰一个实例方法，该方法会在每一个测试方法执行之后执行一次。 | 释放资源(清理工作) |
| @BeforeAll | 用来修饰一个静态方法，该方法会在所有测试方法之前只执行一次。 | 初始化资源(准备工作) |
| @AfterAll | 用来修饰一个静态方法，该方法会在所有测试方法之后只执行一次。 | 释放资源(清理工作) |
| @ParameterizedTest | 参数化测试的注解 (可以让单个测试运行多次，每次运行时仅参数不同) | 用了该注解，就不需要@Test注解了 |
| @ValueSource | 参数化测试的参数来源，赋予测试方法参数 | 与参数化测试注解配合使用 |
| @DisplayName | 指定测试类、测试方法显示的名称 （默认为类名、方法名） |  |

演示 `@BeforeEach`，`@AfterEach`，`@BeforeAll`，`@AfterAll` 注解：

```java
public class UserServiceTest {

    @BeforeEach
    public void testBefore(){
        System.out.println("before...");
    }

    @AfterEach
    public void testAfter(){
        System.out.println("after...");
    }

    @BeforeAll //该方法必须被static修饰
    public static void testBeforeAll(){
        System.out.println("before all ...");
    }

    @AfterAll //该方法必须被static修饰
    public static void testAfterAll(){
        System.out.println("after all...");
    }

    @Test
    public void testGetAge(){
        Integer age = new UserService().getAge("110002200505091218");
        System.out.println(age);
    }

    @Test
    public void testGetGender(){
        String gender = new UserService().getGender("612429198904201611");
        System.out.println(gender);
    }
 }
```

演示 `@ParameterizedTest` ，`@ValueSource` ，`@DisplayName` 注解：

```java
package com.itheima;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("测试-学生业务操作")
public class UserServiceTest {

    @DisplayName("测试-获取年龄")
    @Test
    public void testGetAge(){
        Integer age = new UserService().getAge("110002200505091218");
        System.out.println(age);
    }

    @DisplayName("测试-获取性别")
    @Test
    public void testGetGender(){
        String gender = new UserService().getGender("612429198904201611");
        System.out.println(gender);
    }

    @DisplayName("测试-获取性别3")
    @ParameterizedTest
    @ValueSource(strings = {"612429198904201611","612429198904201631","612429198904201626"})
    public void testGetGender3(String idcard){
        String gender = new UserService().getGender(idcard);
         System.out.println(gender);
    }
}
```

输出结果如下：

![](14017924225-09.jpg)



### 依赖范围

依赖的jar包，默认情况下，可以在任何地方使用，在main目录下，可以使用；在test目录下，也可以使用。 在maven中，如果希望限制依赖的使用范围，可以通过 `<scope>…</scope>` 设置其作用范围。 scope的取值常见的如下：

| scope值 | 主程序 | 测试程序 | 打包（运行） | 范例 |
| --- | --- | --- | --- | --- |
| compile（默认） | Y | Y | Y | log4j |
| test | \- | Y | \- | junit |
| provided | Y | Y | \- | servlet-api |
| runtime | \- | Y | Y | jdbc驱动 |
