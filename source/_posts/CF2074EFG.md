---
title: "CF2074EFG"
date: 2026-03-25 23:50:25
updated: 2026-03-25 23:53:29
zhihu_url: "https://zhuanlan.zhihu.com/p/2020285023954163085"
zhihu_id: "2020285023954163085"
---
大概率只有自己能看懂的题解，只是简单记录一下

### CF2074E

[#随机化](https://zhuanlan.zhihu.com/write#%E9%9A%8F%E6%9C%BA%E5%8C%96) [#随机数生成](https://zhuanlan.zhihu.com/write#%E9%9A%8F%E6%9C%BA%E6%95%B0%E7%94%9F%E6%88%90)
生成随机数的代码： mt19937 rng(clock() + time(0));

```text
#include <bits/stdc++.h>
#define int long long
using namespace std;
using PII = pair<int, int>;

mt19937 rng(clock()+time(0));

void solve() {
    int n;
    cin >> n;
    if (n == -1)
        exit(0);

    auto query = [&](int x, int y, int z) -> int {
        cout << "? " << x << " " << y << " " << z << endl;
        int res;
        cin >> res;
        if (res == -1)
            exit(0);
        return res;
    };

    auto submit = [&](int x, int y, int z) { cout << "! " << x << " " << y << " " << z << endl; };

    int x = 1, y = 2, z = 3;
    while (true) {
        int p = query(x, y, z);
        if (p == 0) {
            submit(x, y, z);
            return;
        }
        int t = rng() % 3;
        if (t == 0)
            x = p;
        else if (t == 1)
            y = p;
        else
            z = p;
    }
}

signed main() {
    int T = 1;
    cin >> T;
    while (T--)
        solve();
}
```

### CF2074F

[#线段树](https://zhuanlan.zhihu.com/write#%E7%BA%BF%E6%AE%B5%E6%A0%91) [#二分](https://zhuanlan.zhihu.com/write#%E4%BA%8C%E5%88%86) [#分块](https://zhuanlan.zhihu.com/write#%E5%88%86%E5%9D%97) [#暴力](https://zhuanlan.zhihu.com/write#%E6%9A%B4%E5%8A%9B)
题意：给你一个 a\\times b 的矩形，你需要用边长为 2^k 的正方形覆盖它，问最少用多少个正方形可以恰好覆盖
思路：把 a\\times b 的矩阵拆分成两个维度来看，把 a 和 b 分别拆分成一堆 2^k 长度的段，然后枚举 x 和 y 上所有拆分出来的段，计算答案即可，这里切分需要用到线段树的思想

```text
#include <bits/stdc++.h>
#define int long long
using namespace std;
using PII = pair<int, int>;

void solve() {
    int l1, r1, l2, r2;
    cin >> l1 >> r1 >> l2 >> r2;

    vector<PII> it1, it2;
    auto rec = [&](auto &&rec, int L, int R, int l, int r, vector<PII> &v) -> void {
        if (r <= L || l >= R)
            return;
        if (l <= L && R <= r) {
            v.emplace_back(L, R);
            return;
        }
        rec(rec, L, (L + R) / 2, l, r, v);
        rec(rec, (L + R) / 2, R, l, r, v);
    };

    rec(rec, 0, 1 << 25, l1, r1, it1);
    rec(rec, 0, 1 << 25, l2, r2, it2);
    int ans = 0;

    for (auto [al, ar] : it1) {
        for (auto [bl, br] : it2) {
            int a = ar - al, b = br - bl;
            if (a < b)
                swap(a, b);
            ans += a / b;
        }
    }

    cout << ans << endl;
}

signed main() {
    ios::sync_with_stdio(0);
    cin.tie(0), cout.tie(0);
    int T = 1;
    cin >> T;
    while (T--)
        solve();
}
```

### CF2074G

[#多边形DP](https://zhuanlan.zhihu.com/write#%E5%A4%9A%E8%BE%B9%E5%BD%A2DP) [#区间DP](https://zhuanlan.zhihu.com/write#%E5%8C%BA%E9%97%B4DP) [#处理环形](https://zhuanlan.zhihu.com/write#%E5%A4%84%E7%90%86%E7%8E%AF%E5%BD%A2)
题意：给你一个多边形，你可以选择三个顶点，并且得到三个顶点乘积的值，目标是最大化得到的值，但是你不能选择三个顶点形成的三角形与先前的三角形重叠

思路：考虑区间 DP，在 \[0,n-1\] 区间内做 DP，我们需要枚举每一个区间中的一个点，作为 l,r 以外的第三点 k 去构成一个三角形。选中点后，区间就可以被拆成两个区间 \[l + 1,k\] 和 \[k + 1, r\] ，这里就可以引出状态转移方程：

dp\[L,R\]=max(dp\[L,k-1\]+dp\[k+1\]\[R\]+score(L,R,K), dp\[L,R\])

区间 DP 的套路：
我们要得到一个长区间的值，就需要先计算出所有小区间的值，在 for 循环中怎么去实现呢？

```text
for (int len = 3; len <= n; len++) // 最外层枚举区间的长度，至少需要三个点，所以从3开始枚举
	for (int L = 0; L <= n - len; L++) // 中间枚举左端点
		int R = L + len - 1;

		// 选择端点L，R，K 组成三角形
		for (int i = L + 1; i < R: i++) // 最里层枚举k，k的取值范围是[L + 1, R - 1]

		// 不选择端点L，R，K 组成三角形
		for (int i = L; i < R: i++)
```

最终的答案就是 dp\[0\]\[n - 1\]

```text
#include <bits/stdc++.h>
#define int long long
using namespace std;
using PII = pair<int, int>;

void solve() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++)
        cin >> a[i];

    vector<vector<int>> dp(n, vector<int>(n));

    auto get = [&](int l, int r) -> int {
        if (l > r || l < 0 || r >= n) {
            return 0;
        }
        return dp[l][r];
    };

    for (int len = 3; len <= n; len++) {
        for (int L = 0; L <= n - len; L++) {
            int R = L + len - 1;

            for (int i = L + 1; i < R; i++) {
                int lp = get(L + 1, i - 1);
                int rp = get(i + 1, R - 1);
                int mp = a[L] * a[R] * a[i];
                dp[L][R] = max(dp[L][R], lp + rp + mp);
            }

            for (int i = L; i < R; i++) {
                dp[L][R] = max(dp[L][R], get(L, i) + get(i + 1, R));
            }
        }
    }

    cout << dp[0][n - 1] << endl;
}

signed main() {
    ios::sync_with_stdio(0);
    cin.tie(0), cout.tie(0);
    int T = 1;
    cin >> T;
    while (T--)
        solve();
}
```
