---
title: "JavaWebDAY5——MySQL"
date: 2024-12-25 09:24:17
updated: 2024-12-25 09:24:17
zhihu_url: "https://zhuanlan.zhihu.com/p/14523815501"
zhihu_id: "14523815501"
---
### 基本语法

### 注释

```sql
-- 注释（两个-加上空格）
```

### 创建表

```sql
create table  表名(
        字段1  字段1类型 [约束]  [comment  字段1注释 ],
        字段2  字段2类型 [约束]  [comment  字段2注释 ],
        ......
        字段n  字段n类型 [约束]  [comment  字段n注释 ]
) [ comment  表注释 ] ;
```

有限制版

```sql
create table tb_user (
    id int primary key comment 'ID,唯一标识',
    username varchar(20) not null unique comment '用户名',
    name varchar(10) not null comment '姓名',
    age int comment '年龄',
    gender char(1) default '男' comment '性别'
) comment '用户表';
```

| 约束 | 描述 | 关键字 |
| --- | --- | --- |
| 非空约束 | 限制该字段值不能为null | not null |
| 唯一约束 | 保证字段的所有数据都是唯一、不重复的 | unique |
| 主键约束 | 主键是一行数据的唯一标识，要求非空且唯一 | primary key |
| 默认约束 | 保存数据时，如果未指定该字段值，则采用默认值 | default |
| 外键约束 | 让两张表的数据建立连接，保证数据的一致性和完整性 | foreign key |
| 主键自增：auto\_increment |  |  |

-   每次插入新的行记录时，数据库自动生成id字段(主键)下的值

-   具有auto\_increment的数据列是一个正数序列开始增长(从1开始自增)


### 数据类型

数值类型

| 类型 | 大小 | 有符号(SIGNED)范围 | 无符号(UNSIGNED)范围 | 描述 |
| --- | --- | --- | --- | --- |
| TINYINT | 1byte | (-128，127) | (0，255) | 小整数值 |
| SMALLINT | 2bytes | (-32768，32767) | (0，65535) | 大整数值 |
| MEDIUMINT | 3bytes | (-8388608，8388607) | (0，16777215) | 大整数值 |
| INT/INTEGER | 4bytes | (-2147483648，2147483647) | (0，4294967295) | 大整数值 |
| BIGINT | 8bytes | (-2^63，2^63-1) | (0，2^64-1) | 极大整数值 |
| FLOAT | 4bytes | (-3.402823466 E+38，3.402823466351 E+38) | 0 和 (1.175494351 E-38，3.402823466 E+38) | 单精度浮点数值 |
| DOUBLE | 8bytes | (-1.7976931348623157 E+308，1.7976931348623157 E+308) | 0 和 (2.2250738585072014 E-308，1.7976931348623157 E+308) | 双精度浮点数值 |
| DECIMAL |  | 依赖于M(精度)和D(标度)的值 | 依赖于M(精度)和D(标度)的值 | 小数值(精确定点数) |
| 字符串类型 |  |  |  |  |
| !\[\[Pasted image 20241225082834.png\]\] |  |  |  |  |

日期时间类型 !\[\[Pasted image 20241225082954.png\]\]

### 表查询-添加-修改删除

```sql
-- 查询当前数据库的所有表
show tables;

-- 查看指定的表结构
desc 表名 ;   -- 可以查看指定表的字段、字段的类型、是否可以为NULL、是否存在默认值等信息

-- 查询指定表的建表语句
show create table 表名 ;
-- 添加字段
alter table 表名 add  字段名  类型(长度)  [comment 注释]  [约束];

-- 比如： 为tb_emp表添加字段qq，字段类型为 varchar(11)
alter table tb_emp add  qq  varchar(11) comment 'QQ号码';
```

### DQL

```sql
SELECT
        字段列表
FROM
        表名列表
WHERE
        条件列表
GROUP  BY
        分组字段列表
HAVING
        分组后条件列表
ORDER BY
        排序字段列表
LIMIT
        分页参数
```

### 聚合函数

常用聚合函数：

| 函数 | 功能 |
| --- | --- |
| count | 统计数量 |
| max | 最大值 |
| min | 最小值 |
| avg | 平均值 |
| sum | 求和 |

```sql
-- count(字段)
select count(id) from emp;-- 结果：30
select count(job) from emp;-- 结果：29 （聚合函数对NULL值不做计算）

-- count(常量)
select count(0) from emp;
select count('A') from emp;

-- count(*)  推荐此写法（MySQL底层进行了优化）
select count(*) from emp;
```

### 分组查询

```sql
select job, count(*)
from emp
where entry_date <= '2015-01-01'   -- 分组前条件
group by job                      -- 按照job字段分组
having count(*) >= 2;             -- 分组后条件
```

-   分组之后，查询的字段一般为聚合函数和分组字段，查询其他字段无任何意义

-   执行顺序：where > 聚合函数 > having


**where与having区别（面试题）**

-   执行时机不同：where是分组之前进行过滤，不满足where条件，不参与分组；而having是分组之后对结果进行过滤。

-   判断条件不同：where不能对聚合函数进行判断，而having可以。


### 排查查询

```sql
select id, username, password, name, gender, phone, salary, job, image, entry_date, create_time, update_time
from emp
order by entry_date ASC; -- 按照entrydate字段下的数据进行升序排序

select id, username, password, name, gender, phone, salary, job, image, entry_date, create_time, update_time
from emp
order by  entry_date; -- 默认就是ASC（升序）
```

-   排序方式：


-   ASC ：升序（默认值）

-   DESC：降序


```sql
select  字段列表
from   表名
[where  条件列表]
[group by  分组字段 ]
order  by  字段1  排序方式1 , 字段2  排序方式2 … ;
```

### 分页查询

```sql
select  字段列表  from  表名  limit  起始索引, 查询记录数 ;
```

-   案例1：从起始索引0开始查询员工数据, 每页展示5条记录

```sql
select id, username, password, name, gender, phone, salary, job, image, entry_date, create_time, update_time
from emp
limit 0 , 5; -- 从索引0开始，向后取5条记录
```

1.  起始索引从0开始。 计算公式 ：起始索引 = （查询页码 - 1）\* 每页显示记录数

2.  分页查询是数据库的方言，不同的数据库有不同的实现，MySQL中是LIMIT

3.  如果查询的是第一页数据，起始索引可以省略，直接简写为 limit 条数
