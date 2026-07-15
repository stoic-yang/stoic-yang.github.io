---
title: "论文阅读：MultimodalHD"
date: 2026-03-16 20:32:41
updated: 2026-03-16 20:32:41
zhihu_url: "https://zhuanlan.zhihu.com/p/2016974549703483675"
zhihu_id: "2016974549703483675"
math: true
---
### 研究问题

模态异构性问题：不同客户端会从不同类型的传感器中采集数据，例如加速度计、陀螺仪等。现有最先进的多模态联邦学习方法通常采用模态专属模块（一般是RNN）来处理每一种模态。在边缘设备上运行资源开销较大。

模态干扰问题：在模态异构的多模态联邦学习中，不同客户端基于不同模态组合进行训练，容易形成分布不同、参数偏向不同的本地模型；若仍采用统一聚合策略，这些不一致的模型更新会相互干扰，造成性能下降。

### 创新点

1.  用静态HD编码器把多模态时序传感器编码成超向量，绕开 RNN 计算，从而降低边缘端计算的开销
2.  把 attention fusion 机制迁移到 MFL 上
3.  基于客户端模型相似度进行加权聚合，减少模态干扰

对于创新点的思考：

1.  没有做消融实验：作者提出了三个创新点，但实验上只真正单独验证了聚合策略；attention fusion 和 HD encoder 没有做消融实验，所以没法精确了解这两个创新点对实验最终结果的贡献是多少，我认为这个是实验的一个不足之处
2.  这里除开第三个创新点，做的只是 A+B 的融合，或者迁移，第一点是观察到了 RNN 带来的计算的开销，所以寻找了一个用静态编码去替代 RNN 的思路，这是第一个创新点的动机，对于第二个创新点，attention fusion 本身在多模态学习中并不是新的思想，在这篇论文里更像是将已有机制迁移到 MFL 场景中。论文在说明其有效性时，更多是和较原始的 concat 作比较
3.  第三个创新点，本质上是基于客户端模型相似度进行加权聚合，使相似客户端贡献更大、不相似客户端贡献更小。更像是在抑制异质更新的负面影响，而不是真正建模并消除模态干扰，这里性能提升也可能部分来自对边缘客户端或少数模态组合的弱化

### HD 对时间序列传感器数据的编码过程

![](2016974549703483675-01.png)

先把传感器读数的取值范围量化为 q 个区间，每一个 level 对应一个高维的二值向量，第一个 level 是随机生成的，后续的 level 通过上一个 level 随机反转得到的，这样就可以让相邻数值区间对应的向量比较接近，从而保留原始数值的相对结构

右边是时间序列 HD 的编码过程

1.  Quantize 把每个时刻的传感器读数进行量化，对应得到一个 level hyoervector
2.  和 Sensor ID 绑定 与传感器的 ID 做一个 xor，标识不同的模态
3.  用 permutation 编码时间顺序 为了加入时序信息，作者对第 t 个时刻的结果做了一个逻辑移位

    $$
    ρ(t,Lt⊗IDj)
    $$



4.  把 $t =1$ 到 $t= T$ 时刻的结果结合起来，做一个 bipolarize 的操作，转化为 `{-1, +1}` 的形式

    $$
    θ(xi(j))=BP(ρ(1,L1⊗IDj)⊗⋯⊗ρ(T,LT⊗IDj))
    $$



    proximity-based aggregation
    作者提出的 proximity-based aggregation 是一种基于客户端模型相似度的个性化聚合方法。设客户端上传的本地模型为 $\{w_{1},\dots,w_{n}\}$ ，首先计算任意两个客户端模型之间的余弦相似度：

$$
S_{ij}^{\cos}=\cos(w_{i},w_{j})
$$

然后对客户端 $i$ 的相似度向量做 softmax，得到客户端 $j$ 在更新 $i$ 时的聚合权重：

$$
\text{softmax}(S_i^{cos})_j = \frac{\exp(S_{ij}^{cos} / \tau)}{\sum_{k=1}^N \exp(S_{ik}^{cos} / \tau)}
$$

最后客户端 $i$ 的新模型由所有客户端模型加权得到：

$$
w_i^{new} = \sum_{j=1}^N \text{softmax}(S_i^{cos})_j \cdot w_j
$$

相似客户端贡献更大，不相似客户端贡献更小，从而减少模态不匹配带来的聚合冲突。

### 实验

### 实验数据集以及参数配置

实验部分主要是在三个多模态人体活动识别数据集上做的，分别是 HAR、MHEALTH 和 OPP。论文把任务设定成模态异构的 MFL，也就是不同客户端拥有不同的传感器组合。评价指标用的是 weighted F1，最后看的是所有客户端平均之后的 F1。实验设置里时间序列长度取 T=128T=128T=128，联邦训练一共 20 轮，每轮本地训练 2 个 epoch，batch size 是 64。对比的方法主要是两类已有的多模态联邦学习基线：Split-AE 和 FedMSplit。

### 实验结果

在三个数据集上，MultimodalHD 相比现有 MFL baseline 能做到 better/comparable 的结果；其中在 HAR 和 MHEALTH 上，FedMSplit 最后还是略强一点，但作者强调 MultimodalHD 的性能已经比较接近最优，而且在 HAR 上收敛轮次还更快一些，在接近 SOTA 的水平上做到了更高的效率。

### 聚合策略对比分析

然后论文还单独做了一组聚合策略的对比实验。这里它固定本地模型训练流程，只替换联邦聚合方式，比较了 FedAvg、FedPer 和它自己的 proximity-based aggregation。结果是，在 HAR 和 MHEALTH 上，FedAvg 的结果最差，因为它对不同模态训练出来的模型做了一种比较粗暴的等权聚合。FedPer 因为允许最后的 MLP 层个性化，所以会稍微好一点；而论文自己的 proximity-based aggregation 在这两组数据上还能进一步提升。至于 OPP，三种聚合方式差别不大，论文把这个现象解释成 OPP 的模态异构性相对更弱。

### 实验效率

效率实验其实是这篇最值得记的地方。论文专门在 Raspberry Pi 4B 上比较了不同方法每个 epoch 的训练时间，结果显示 MultimodalHD 比神经网络基线快 2x–8x。作者给出的解释是，HD 方法本身比较轻量，而且绕开了 RNN 这类顺序计算比较重的结构。虽然前面多了一个对多模态时间序列做 HD 编码的过程，但这个编码只需要在训练开始的时候做一次，后面随着训练进行，这部分成本会被摊薄；再加上静态编码器本身还比较容易并行，所以整体上时间优势比较明显。这个实验其实也是第一点创新最主要的支撑。

### 消融实验

没有做完整的模块级消融实验。论文虽然对 aggregation 做了单独比较，但对于 HD encoder 和 attention fusion，都没有在同一个统一框架下做严格的替换实验。所以最后只能知道整套方法效果还不错，也能看出聚合策略有一定作用，但很难精确判断前两个创新点分别到底贡献了多少。

### 实验结果

从实验结果来看，这篇论文的优势主要不在于精度绝对领先，而在于在保持接近 SOTA 性能的同时，取得了更好的训练效率。

### 论文复现

跑了一下 HAR 的结果，在 M4 的 mba 上 80s 就跑出结果了，联邦确实不太吃算力，但是因为没有风扇，电脑直接开始发烫了，所以就没有接着跑其他的数据集了

复现最终结果的平均值是 0.816，跟论文的 0.821 相差不大

### 核心算法代码

我比较感兴趣的首先就是这个 HD 编码在代码层面是怎么做的

```text
def init_hvs(self):
    # level hvs
    num_flip = int(self.D * self.P)
    self.level_hvs = [np.random.randint(2, size=self.D)]
    for i in range(self.quantization_num-1):
        new = copy.deepcopy(self.level_hvs[-1])
        idx = np.random.choice(self.D,num_flip,replace=False)
        new[idx] = 1-new[idx]
        self.level_hvs.append(new)
    self.level_hvs = np.stack(self.level_hvs)

    # id hvs
    self.id_hvs = []
    if self.mode == "HAR":
        for i in range(9):
            self.id_hvs.append(np.random.randint(2, size=self.D))
    if self.mode == "MHEALTH":
        for i in range(21):
            self.id_hvs.append(np.random.randint(2, size=self.D))
    if self.mode == "OPP":
        for i in range(39):
            self.id_hvs.append(np.random.randint(2, size=self.D))
    self.id_hvs = np.stack(self.id_hvs)
```

quantize:

```text
def quantize(self, one_sample):
    T,M = one_sample.shape
    quantization = self.level_hvs[
        ((((one_sample - self.min) / self.range) * self.quantization_num) - 1).astype('i')
    ]
    return quantization
```

permute:

```text
def permute(self,a):
    for i in range(len(a)):
        a[i] = np.roll(a[i],i,axis=1)
    return a
```

这几个 HD 编码的核心步骤实现起来还是不难的

然后是 proximity-based aggregation 相关的代码

把每个 client 的模型参数拼成一个大向量，然后算 pairwise cosine，相似度做 softmax 得到权重：

```text
def cal_proximity_matrix(self, clients_parameters):
    # 记录参数顺序
    param_order = list(clients_parameters[0].keys())

    # 每个 client -> 一个长向量
    parameter_space_vector = []
    for params in clients_parameters:
        vec_parts = [torch.flatten(params[k]) for k in param_order]
        parameter_space_vector.append(torch.cat(vec_parts, dim=0))
    parameter_space_vector = torch.stack(parameter_space_vector)  # [N, D']

    # 余弦相似度矩阵
    cos_sim_matrix = []
    for i in range(self.num_client):
        cos_sim_matrix.append(
            torch.nn.functional.cosine_similarity(
                parameter_space_vector[i], parameter_space_vector
            )
        )

    # softmax(sim / temperature) -> 权重矩阵
    softmax_scores = []
    for i in range(self.num_client):
        softmax_scores.append(
            torch.nn.functional.softmax(cos_sim_matrix[i] / self.temperature, dim=0)
        )
    return softmax_scores
```

aggregate\_network\_proximity：全参数 proximity 聚合

```text
def aggregate_network_proximity(self):
    # 收集每个 client 的可训练参数
    clients_parameters = []
    for c in self.clients:
        params = {}
        for name, p in c.model.named_parameters():
            if p.requires_grad:
                params[name] = p.data
        clients_parameters.append(params)

    # 计算 softmax 权重矩阵
    softmax_score = self.cal_proximity_matrix(clients_parameters)
    self.display_info(str(softmax_score))

    for i in range(self.num_client):
        for name, p in self.clients[i].model.named_parameters():
            if p.requires_grad:
                param_list = [cp[name] for cp in clients_parameters]
                score_list = softmax_score[i].tolist()
                param_update = sum(a * b for a, b in zip(param_list, score_list))
                p.data = copy.deepcopy(param_update)

    self.display_info('Network aggregated (Proximity)')
```
