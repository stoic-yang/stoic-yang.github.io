---
title: "论文阅读与复现：FedMultimodal:A Benchmark For Multimodal Federated Learning"
date: 2026-03-13 13:21:25
updated: 2026-03-13 13:21:39
zhihu_url: "https://zhuanlan.zhihu.com/p/2015778758578176664"
zhihu_id: "2015778758578176664"
math: true
---
![](2015778758578176664-01.png)

提出了一个面向多模态联邦学习的 benchmark（Fedmultimodal），用于系统评测不同数据集、融合方法、联邦优化器以及真实噪声条件下的模型表现

整体流程

1.  选定多模态数据集
2.  按自然划分或 Dirichlet 划分分配到不同 client
3.  用预训练特征提取器提取各模态特征
4.  各模态进入对应编码器
5.  用 concat 或 attention 做模态融合
6.  在联邦学习框架下用 FedAvg / FedProx / FedOpt 等训练
7.  评测性能和鲁棒性
8.  联邦学习的在真实世界下数据的分布是 non-IID，所以划分数据给各个 client 应该避免暴力地划分以模拟真实情境下的联邦学习，一个常见的划分方法是按照 id 去进行数据的划分，一个 client 大部分的数据都只来自于一个客户端 id
9.  直接读取原数据集进行训练对于边缘设备来说是巨大的性能开销，所以不是从头开始训练模型，而是利用成熟的预训练模型作为骨干网络来提取特征，再训练下游模型（类似 yolo）

在多模态的融合上，论文提供了两种方法，一种是直接把不同模态的特征进行 concat 拼接，另外一种是 attention 融合，让模型自己学习分配权重

多模态特征融合应该会是以后研究的一个重点，可以继续去了解最新的多模态融合的工作是怎么做的，也可以深入探究背后的数学公式，多模态信息怎么整合到一块的对我来说是黑盒，具体的数学原理应该会比较有意思

联邦学习训练算法除开了最经典的 FedAvg 外，还有 FedProx、FedOpt，在这篇论文里，FedOpt 的性能是最好的，我简单了解了一下 FedAvg 和 FedOpt

FedAvg 实际上就是按照数据量去分配各个 client 的权重，计算公式不难理解

$$
w_{t+1}=\frac{∑_{k=1}^Kn_{k}w_{t+1}^k}{n}
$$



FedProx 面向数据异质性太强做了一些改进，在本地训练的时候加了一个约束项

$$
F_{k}(w)+\frac{\mu}{2}∥w−w_{t}∥^2
$$

这个我认为来自于最优化理论的启发，应该是罚函数的思想



FedOpt 的原理我没怎么看懂，但底层原理和以上两种算法思想差异比较大

多模态联邦学习上这篇论文主要提供了三种常见问题的模拟：模态缺失、标签缺失、错误标签

论文的第四节对实验细节、实验结果做了一个介绍和总结，我比较在意的点在于多模态虽然比单模态的性能普遍强 5%，但5%的提升太小了，不知道后续的研究有没有办法让多模态比起单模态的性能能有更大的提升

实验对于三种问题的模拟用到了一些概率论的方法，我目前不太明白具体是怎么实现的，这里可以去看一下底层的代码是怎么实现的

* * *

论文复现

跑通论文仓库的代码并不难

最后可以得到FedAvg / FedProx / FedOpt 在 $\alpha=5$ 和 $\alpha=0.1$ 的情况下 F1 的值

与 baseline 对比差距都在 1%以内

* * *

代码细节分析

这篇论文的工程性做的挺好的，大部分的调整都可以通过运行 train.py 的时候通过传入不同args来进行调整，包括模态缺失、标签缺失、标签错误是否开启以及对应的比例，所以我这几天主要去看了一下这份代码的工程架构以及数据流动，顺带补齐一些机器学习的基础

整份代码的架构，主要分三块，Server、Client以及Model

Server主要辅助管理全局的训练信息以及负责做聚合算法，Client管理本地训练的逻辑，可以在这里调整本地训练epoch等等，Model管理模型结构，里面有不同数据集对应的神经网络的架构，现在在上面做一些简单的魔改应该不成问题了，就比如在某个结构上多加一层pooling，或者 conv 和 norm

除开架构以外，我还读了论文代码是怎么对dataset、dataloader进行进一步封装的，FedAvg是如何实现的，大致理通了代码层面上（server）是如何把数据分发给各个客户端（client）上，并且客户端进行完自己的本地训练后怎么把数据数据汇总上传到server，最后完成一轮全局参数更新的主线

先从数据处理开始（dataload\_manager） dataload\_manager.py 把 torch. data 的 DataLoader 进一步封装了

```text
def set_dataloader(
    self,
    data_a: dict,
    data_b: dict,
    default_feat_shape_a: np.array=np.array([0, 0]),
    default_feat_shape_b: np.array=np.array([0, 0]),
    client_sim_dict: dict=None,
    shuffle: bool=False
) -> (DataLoader):
```

通过传入一个 client\_sim\_dict 去控制每个样本的模拟配置

```text
labeled_data_idx, unlabeled_data_idx = [], []
if client_sim_dict is not None:
    for idx in range(len(client_sim_dict)):
        sim_data = client_sim_dict[idx][-1]
        if sim_data[0] == 1: data_a[idx][-1] = None   # 模态 A 缺失
        if sim_data[1] == 1: data_b[idx][-1] = None   # 模态 B 缺失
        data_a[idx][-2] = sim_data[2]                 # label noise：改 label
        # missing label
        if sim_data[-1] == 0:
            labeled_data_idx.append(idx)
        else:
            unlabeled_data_idx.append(idx)
```

如果标签缺失就不再参与最后的 dataloader 的构建

```text
labeled_data_a, unlabeled_data_a = list(), list()
labeled_data_b, unlabeled_data_b = list(), list()
	if len(unlabeled_data_idx) > 0:
		for idx in labeled_data_idx:
			labeled_data_a.append(data_a[idx])
			labeled_data_b.append(data_b[idx])
		for idx in unlabeled_data_idx:
			unlabeled_data_a.append(data_a[idx])
			unlabeled_data_b.append(data_b[idx])
		data_a = labeled_data_a
		data_b = labeled_data_b
```

组装 dataset

```text
data_ab = MMDatasetGenerator(
    data_a,
    data_b,
    default_feat_shape_a,
    default_feat_shape_b,
    len(data_a),
    self.args.dataset
)
```

再来看训练代码（train. py）

```text
# argument parser
args = parse_args() #这里预处理好所有给train.py传入的参数

# data manager
dm = DataloadManager(args) #把传入的参数用于data manager的初始化
dm.get_simulation_setting(alpha=args.alpha) #设置样本的异质性，越大样本越平均

# find device
device = torch.device("cuda:1") if torch.cuda.is_available() else "cpu"
if torch.cuda.is_available(): print('GPU available, use GPU')
save_result_dict = dict()

# 根据传入参数进行联邦算法的选择
if args.fed_alg in ['fed_avg', 'fed_prox', 'fed_opt']:
    Client = ClientFedAvg
elif args.fed_alg in ['scaffold']:
    Client = ClientScaffold
elif args.fed_alg in ['fed_rs']:
    Client = ClientFedRS

# load simulation feature
dm.load_sim_dict()
# load client ids
dm.get_client_ids()
# set dataloaders
dataloader_dict = dict()
logging.info('Reading Data')
```

分发数据给各个客户端，给每个客户端准备好一个 dataloader

```text
for client_id in tqdm(dm.client_ids):
        acc_dict = dm.load_acc_feat(
            client_id=client_id
        )
        gyro_dict = dm.load_gyro_feat(
            client_id=client_id
        )
        dm.get_label_dist(
            gyro_dict,
            client_id
        )
        shuffle = False if client_id in ['dev', 'test'] else True
        client_sim_dict = None if client_id in ['dev', 'test'] else dm.get_client_sim_dict(client_id=client_id)
        dataloader_dict[client_id] = dm.set_dataloader(
            acc_dict,
            gyro_dict,
            shuffle=shuffle,
            client_sim_dict=client_sim_dict,
            default_feat_shape_a=np.array([128, constants.feature_len_dict[args.acc_feat]]),
            default_feat_shape_b=np.array([128, constants.feature_len_dict[args.gyro_feat]]),
        )
```

对于每一个 client，先创建通过全局读取 client 的数据初始化，然后再进行一次训练，训练完后在把训练的结果更新到 server 上保存

```text
client = Client(
                    args,
                    device,
                    criterion,
                    dataloader,
                    model=copy.deepcopy(server.global_model),
                    label_dict=dm.label_dist_dict[client_id],
                    num_class=constants.num_class_dict[args.dataset]
                )

                if args.fed_alg == 'scaffold':
                    client.set_control(
                        server_control=copy.deepcopy(server.server_control),
                        client_control=copy.deepcopy(server.client_controls[client_id])
                    )
                    client.update_weights()

                    # server append updates
                    server.set_client_control(client_id, copy.deepcopy(client.client_control))
                    server.save_train_updates(
                        copy.deepcopy(client.get_parameters()),
                        client.result['sample'],
                        client.result,
                        delta_control=copy.deepcopy(client.delta_control)
                    )
                else:
                    client.update_weights()
                    # server append updates
                    server.save_train_updates(
                        copy.deepcopy(client.get_parameters()),
                        client.result['sample'],
                        client.result
                    )
                del client
```

实际训练的过程中，对于全局模型有一个 epoch，对于本地的模型其实也有一个自己的 epoch，本地模型跑完自己的 epoch 后才会把自己的数据更新上 server 上

本地训练主循环：

```text
for iter in range(int(self.args.local_epochs)):
     for batch_idx, batch_data in enumerate(self.dataloader):
         if self.args.dataset == 'extrasensory' and batch_idx > 20: continue
         self.model.zero_grad()
         optimizer.zero_grad()
         if self.args.modality == "multimodal":
             x_a, x_b, l_a, l_b, y = batch_data
             x_a, x_b, y = x_a.to(self.device), x_b.to(self.device), y.to(self.device)
             l_a, l_b = l_a.to(self.device), l_b.to(self.device)

             # forward
             outputs, _ = self.model(
                 x_a.float(), x_b.float(), l_a, l_b
             ) #调用self.model()，会自动进入model的向前传播
         else:
             x, l, y = batch_data
             x, l, y = x.to(self.device), l.to(self.device), y.to(self.device)

             # forward
             outputs, _ = self.model(
                 x.float(), l
             )
```

FedAvg 参数聚合

```text
def average_weights(self):
    """
    Returns the average of the weights.
    """
    # there are no samples, return
    if len(self.num_samples_list) == 0:
        return
    total_num_samples = np.sum(self.num_samples_list) # 计算总样本数
    w_avg = copy.deepcopy(self.model_updates[0])

    # calculate weighted updates
    for key in w_avg.keys():
        if self.args.fed_alg == 'scaffold':
            w_avg[key] = torch.div(self.model_updates[0][key], len(self.model_updates))
        else:
            w_avg[key] = self.model_updates[0][key]*(self.num_samples_list[0]/total_num_samples) # 根据样本数量比重初始化每个client的权重
    for key in w_avg.keys():
        for i in range(1, len(self.model_updates)):
            if self.args.fed_alg == 'scaffold':
                w_avg[key] += torch.div(self.model_updates[i][key], len(self.model_updates))
            else:
                w_avg[key] += torch.div(self.model_updates[i][key]*self.num_samples_list[i], total_num_samples) # 累加所有客户端
```
