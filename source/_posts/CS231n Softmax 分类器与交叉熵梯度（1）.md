---
title: "CS231n Softmax 分类器与交叉熵梯度（1）"
date: 2026-05-18 18:36:36
updated: 2026-05-18 18:54:51
zhihu_url: "https://zhuanlan.zhihu.com/p/2039775805664972944"
zhihu_id: "2039775805664972944"
math: true
---
Softmax 分类器与交叉熵梯度

> [!abstract] 这篇笔记整理 CS231n assignment1 中 Softmax loss 的前向计算、交叉熵含义、梯度推导和 NumPy 实现。相关课程索引见 \[\[CS231n\]\]。

### 变量形状

| 符号 | 形状 | 含义 |
| --- | --- | --- |
| X | N \\times D | 一个 minibatch 的输入数据 |
| x\_i | 1 \\times D | 第 i 个样本 |
| W | D \\times C | 线性分类器权重 |
| y\_i | 标量 | 第 i 个样本的正确类别 |
| S | N \\times C | 所有样本在所有类别上的 score |
| P | N \\times C | softmax 后的类别概率 |

其中 $N$ 是样本数，$D$ 是特征维度，$C$ 是类别数。CIFAR-10 中 $C=10$。

### 前向计算

对单个样本 $x_i$，线性分类器先计算每个类别的分数：

$$
s_i = x_i W
$$

第 $j$ 个类别的分数是：

$$
s_{ij} = x_i W_{:,j}
$$

Softmax 把分数转成概率：

$$
p_{ij} = \frac{\exp(s_{ij})}{\sum_{k=1}^{C}\exp(s_{ik})}
$$

代码里会先做数值稳定处理：

$$
s_i \leftarrow s_i - \max_j s_{ij}
$$

这是合法的，因为对任意常数 $a$：

$$
\frac{\exp(s_{ij} - a)}{\sum_{k=1}^{C}\exp(s_{ik} - a)} = \frac{\exp(s_{ij})}{\sum_{k=1}^{C}\exp(s_{ik})}
$$

也就是说，整体平移 scores 不会改变 softmax 的概率。

### Loss 的含义

第 $i$ 个样本的 Softmax 交叉熵 loss 是正确类别概率的负对数：

$$
L_i = -\log p_{i,y_i}
$$

展开可得：

$$
L_i = -\log \frac{\exp(s_{i,y_i})}{\sum_{k=1}^{C}\exp(s_{ik})}
$$

进一步化简：

$$
L_i = -s_{i,y_i} + \log \sum_{k=1}^{C}\exp(s_{ik})
$$

这个形式很适合推导梯度。

> [!tip] 初始 loss 为什么接近 $-\log(0.1)$ 初始化时 $W$ 很小，各类别 score 接近，softmax 后每类概率大约是 $\frac{1}{10}$。因此 CIFAR-10 的初始单样本 loss 约为：
>
> $$
> -\log \frac{1}{10} = \log 10 \approx 2.3026
> $$

### 对 score 的梯度

从化简后的单样本 loss 出发：

$$
L_i = -s_{i,y_i} + \log \sum_{k=1}^{C}\exp(s_{ik})
$$

对某个类别分数 $s_{ij}$ 求导：

$$
\frac{\partial L_i}{\partial s_{ij}} = \frac{\partial}{\partial s_{ij}} \left( -s_{i,y_i} + \log \sum_{k=1}^{C}\exp(s_{ik}) \right)
$$

第一项给出：

$$
\frac{\partial (-s_{i,y_i})}{\partial s_{ij}} = \begin{cases} -1, & j = y_i \\ 0, & j \ne y_i \end{cases}
$$

第二项给出：

$$
\frac{\partial}{\partial s_{ij}} \log \sum_{k=1}^{C}\exp(s_{ik}) = \frac{\exp(s_{ij})}{\sum_{k=1}^{C}\exp(s_{ik})} = p_{ij}
$$

所以：

$$
\frac{\partial L_i}{\partial s_{ij}} = p_{ij} - \mathbf{1}(j = y_i)
$$

等价地：

$$
\frac{\partial L_i}{\partial s_{ij}} = \begin{cases} p_{ij} - 1, & j = y_i \\ p_{ij}, & j \ne y_i \end{cases}
$$

### 对权重 $W$ 的梯度

因为：

$$
s_{ij} = \sum_{d=1}^{D} x_{id} W_{dj}
$$

所以：

$$
\frac{\partial s_{ij}}{\partial W_{dj}} = x_{id}
$$

链式法则得到逐元素梯度：

$$
\frac{\partial L_i}{\partial W_{dj}} = x_{id}\left(p_{ij} - \mathbf{1}(j = y_i)\right)
$$

写成列向量形式：

$$
\nabla_{W_{:,j}} L_i = x_i^\top\left(p_{ij} - \mathbf{1}(j = y_i)\right)
$$

如果令 $Y$ 是 one-hot 标签矩阵：

$$
Y_{ij}=\mathbf{1}(j=y_i)
$$

则整个 batch 的平均 loss 为：

$$
L = -\frac{1}{N}\sum_{i=1}^{N}\log P_{i,y_i} + \lambda \sum_{d=1}^{D}\sum_{j=1}^{C} W_{dj}^{2}
$$

对应梯度是：

$$
\nabla_W L = \frac{1}{N}X^\top(P-Y) + 2\lambda W
$$

> [!warning] 正则化系数 CS231n 这里的 loss 写成 $\lambda \sum W^2$，所以正则项梯度是 $2\lambda W$。如果 loss 写成 $\frac{1}{2}\lambda \sum W^2$，梯度才是 $\lambda W$。

### Naive 实现

在 `softmax_loss_naive` 的循环里，已经得到单个样本的概率向量 `p` 后，可以直接构造：

```text
dscores = p.copy()
dscores[y[i]] -= 1

dW += np.outer(X[i], dscores)
```

循环结束后做平均并加正则项：

```text
loss = loss / num_train + reg * np.sum(W * W)
dW = dW / num_train + 2 * reg * W
```

这里 `np.outer(X[i], dscores)` 的形状是：

$$
D \times C
$$

正好和 $W$ 的形状一致。

### 向量化实现

```text
scores = X.dot(W)
scores -= np.max(scores, axis=1, keepdims=True)

probs = np.exp(scores)
probs /= np.sum(probs, axis=1, keepdims=True)

loss = -np.sum(np.log(probs[np.arange(num_train), y]))
loss = loss / num_train + reg * np.sum(W * W)

dscores = probs.copy()
dscores[np.arange(num_train), y] -= 1

dW = X.T.dot(dscores)
dW = dW / num_train + 2 * reg * W
```

向量化代码对应公式：

$$
S = XW
$$

$$
P = \operatorname{softmax}(S)
$$

$$
\nabla_W L = \frac{1}{N}X^\top(P-Y) + 2\lambda W
$$

### `LinearClassifier` 中的 SGD

`LinearClassifier` 是线性分类器的基类，负责通用训练流程；具体使用 SVM loss 还是 Softmax cross-entropy loss 由子类决定：

```text
class Softmax(LinearClassifier):
    def loss(self, X_batch, y_batch, reg):
        return softmax_loss_vectorized(self.W, X_batch, y_batch, reg)
```

训练时每一步不是使用全部训练集，而是随机采样一个 minibatch：

```text
batch_indices = np.random.choice(num_train, batch_size, replace=True)
X_batch = X[batch_indices]
y_batch = y[batch_indices]
```

其中有放回采样允许同一个样本在一个 batch 中出现多次。这样每一步得到的是整体梯度的随机近似，计算更快。

权重更新是标准梯度下降：

$$
W \leftarrow W - \eta \nabla_W L
$$

代码对应：

```text
loss, grad = self.loss(X_batch, y_batch, reg)
self.W -= learning_rate * grad
```

这里 `grad` 与 `self.W` 形状相同。若 $W \in \mathbb{R}^{D \times C}$，则：

$$
grad \in \mathbb{R}^{D \times C}
$$

矩阵写法等价于逐元素更新：

$$
W_{dj} \leftarrow W_{dj} - \eta \frac{\partial L}{\partial W_{dj}}
$$

> [!warning] 更新公式的常见错误 `self.W = learning_rate * grad` 会直接用梯度覆盖权重，训练会退化到接近随机猜测。正确写法必须保留旧权重：
> \> self.W -= learning\_rate \* grad > \`\`\` ## 权重矩阵 <!--MATH\_PH\_72--> 的含义 在线性分类器中： <!--MATH\_PH\_30--> 如果 <!--MATH\_PH\_73-->，<!--MATH\_PH\_74-->，则 <!--MATH\_PH\_75-->。 <!--MATH\_PH\_76--> 的每一列对应一个类别的线性模板： <!--MATH\_PH\_31--> 第 <!--MATH\_PH\_77--> 类的分数为： <!--MATH\_PH\_32--> 因此预测时取分数最高的类别： \`\`\`python scores = X.dot(self.W) y\_pred = np.argmax(scores, axis=1)

对于 CIFAR-10，若使用 bias trick，通常有：

$$
D = 32 \times 32 \times 3 + 1 = 3073,\quad C=10
$$

所以：

$$
W \in \mathbb{R}^{3073 \times 10}
$$

### 正则化如何进入 loss 与梯度

总 loss 包含数据损失和 L2 正则化项：

$$
L = L_{\text{data}} + \lambda \sum_{d=1}^{D}\sum_{j=1}^{C}W_{dj}^{2}
$$

其中 $L_{\text{data}}$ 是模型在训练样本上的分类损失。对 Softmax 来说：

$$
L_{\text{data}} = -\frac{1}{N}\sum_{i=1}^{N}\log \frac{\exp(s_{i,y_i})}{\sum_{j=1}^{C}\exp(s_{ij})}
$$

正则项的梯度为：

$$
\frac{\partial}{\partial W} \left( \lambda \sum_{d=1}^{D}\sum_{j=1}^{C}W_{dj}^{2} \right) = 2\lambda W
$$

所以代码中正则化同时体现在 loss 和梯度：

```text
loss = data_loss + reg * np.sum(W * W)
dW = data_grad + 2 * reg * W
```

### 超参数搜索与验证集

`learning_rate` 控制每次沿负梯度方向走多大一步，`reg` 控制权重惩罚强度。CS231n 中通常用验证集选择这两个超参数：

```text
results = {}
best_val = -1
best_softmax = None

for lr in learning_rates:
    for reg in regularization_strengths:
        classifier = Softmax()
        classifier.train(X_train, y_train, learning_rate=lr, reg=reg,
                         num_iters=1500, verbose=False)

        train_accuracy = np.mean(y_train == classifier.predict(X_train))
        val_accuracy = np.mean(y_val == classifier.predict(X_val))
        results[(lr, reg)] = (train_accuracy, val_accuracy)

        if val_accuracy > best_val:
            best_val = val_accuracy
            best_softmax = classifier
```

选择依据应是验证集准确率 `val_accuracy`，不是训练集准确率。训练集准确率高但验证集准确率低，通常意味着过拟合或超参数不合适。

### 权重可视化

Softmax 分类器学到的每个类别权重 $w_c$ 可以 reshape 成 $32 \times 32 \times 3$ 的图像。它通常看起来像一个模糊的类别模板，而不是清晰图片。

这是因为分类分数是点积：

$$
s_c = x^\top w_c
$$

若输入图像与某个类别的权重模板匹配，该类别分数就会更高。权重图可能带有类别常见背景或颜色，例如飞机与船可能出现蓝色区域，动物类别可能出现绿色或棕色区域。

这些模板模糊的原因是线性分类器每个类别只有一个模板，无法表达同一类别中姿态、位置、背景和外观的复杂变化。

### 易错点

-   `scores -= np.max(scores)` 只是数值稳定处理，不改变 softmax 结果。
-   `softmax.py` 里 “normalized hinge loss” 的注释不准确，这里实际是 Softmax cross-entropy loss。
-   正确类别处需要执行 `dscores[y[i]] -= 1`，因为 $\frac{\partial L_i}{\partial s_{ij}} = p_{ij} - \mathbf{1}(j=y_i)$。
-   正则化 loss 使用 `reg * np.sum(W * W)` 时，梯度必须加 `2 * reg * W`。
-   `LinearClassifier.train()` 中要写 `self.W -= learning_rate * grad`，不要把 `W` 覆盖成 `learning_rate * grad`。
-   notebook 修改外部 `.py` 后若表现仍像旧代码，应重启 kernel 或用 `importlib.reload` 确认实际加载的文件。

### 本地材料

-   Notebook：`/Users/keynary/Code/course/CS231n/assignment1/softmax_zh.ipynb`
-   Softmax loss：`/Users/keynary/Code/course/CS231n/assignment1/cs231n/classifiers/softmax.py`
-   线性分类器训练框架：`/Users/keynary/Code/course/CS231n/assignment1/cs231n/classifiers/linear_classifier.py`

### 关联

-   \[\[CS231n\]\]
-   \[\[交叉熵\]\]
-   \[\[梯度下降\]\]
-   \[\[线性分类器\]\]Softmax 分类器与交叉熵梯度
