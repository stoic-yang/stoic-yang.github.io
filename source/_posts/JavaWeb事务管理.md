---
title: "JavaWeb事务管理"
date: 2024-12-31 11:17:33
updated: 2024-12-31 11:17:33
zhihu_url: "https://zhuanlan.zhihu.com/p/15637273211"
zhihu_id: "15637273211"
---
### 事务管理

**概念：** 事务是一组操作的集合，它是一个不可分割的工作单位。事务会把所有的操作作为一个整体一起向系统提交或撤销操作请求，即这些操作要么同时成功，要么同时失败。

### Spring事务管理

### Transactional

**作用：**就是在当前这个方法执行开始之前来开启事务，方法执行完毕之后提交事务。如果在这个方法执行的过程当中出现了异常，就会进行事务的回滚操作。

**位置：**业务层的方法上、类上、接口上

-   方法上：当前方法交给spring进行事务管理

-   类上：当前类中所有的方法都交由spring进行事务管理

-   接口上：接口下所有的实现类当中所有的方法都交给spring 进行事务管理


说明：可以在 `application.yml` 配置文件中开启事务管理日志，这样就可以在控制看到和事务相关的日志信息了

```yaml
#spring事务管理日志
logging:
  level:
    org.springframework.jdbc.support.JdbcTransactionManager: debug
```

-   异常回滚的属性：`rollbackFor`

-   事务传播行为：`propagation`


**默认情况下，只有出现RuntimeException(运行时异常)才会回滚事务。**

假如我们想让所有的异常都回滚，需要来配置@Transactional注解当中的rollbackFor属性，通过rollbackFor这个属性可以指定出现何种异常类型回滚事务。

@Transactional(rollbackFor = Exception.class)

### propagation

所谓事务的传播行为，指的就是在A方法运行的时候，首先会开启一个事务，在A方法当中又调用了B方法， B方法自身也具有事务，那么B方法在运行的时候，到底是加入到A方法的事务当中来，还是B方法在运行的时候新建一个事务？这个就涉及到了事务的传播行为。

我们要想控制事务的传播行为，在@Transactional注解的后面指定一个属性propagation，通过 propagation 属性来指定传播行为。接下来我们就来介绍一下常见的事务传播行为。

| 属性值 | 含义 |
| --- | --- |
| REQUIRED | 【默认值】需要事务，有则加入，无则创建新事务 |
| REQUIRES\_NEW | 需要新事务，无论有无，总是创建新事务 |
| SUPPORTS | 支持事务，有则加入，无则在无事务状态中运行 |
| NOT\_SUPPORTED | 不支持事务，在无事务状态下运行,如果当前存在已有事务,则挂起当前事务 |
| MANDATORY | 必须有事务，否则抛异常 |
| NEVER | 必须没事务，否则抛异常 |
