---
title: "Acwing 785"
date: 2025-06-22 11:11:49
updated: 2025-06-22 11:11:49
zhihu_url: "https://zhuanlan.zhihu.com/p/1920063640846989091"
zhihu_id: "1920063640846989091"
---
今天开始算法基础的学习

快排模版，

```cpp
#include <iostream>

using namespace std;

const int N = 1e6 + 10;

int n;
int q[N];

void quick_sort(int q[], int l, int r)
{
    if (l >= r) return;
    int i = l - 1, j = r + 1, x = q[(l + r) >> 1];
    while (i < j)
    {
        do i++; while (q[i] < x);
        do j--; while (q[j] > x);
        if (i < j) swap(q[i], q[j]);
    }
    quick_sort(q, l, j), quick_sort(q, j + 1, r);
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &q[i]);

    quick_sort(q, 0, n - 1);

    for (int i = 0; i < n; i++) printf("%d ", q[i]);

    return 0;
}
```

不过这个C的风格太严重了，我不太在意这点性能，我顺便学一下C++的风格

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

class QuickSort {
private:
    void sort(std::vector<int>& nums, int left, int right) {
        if (left >= right) return;

        int pivot = nums[(left + right) / 2];
        int i = left - 1;
        int j = right + 1;

        while (i < j) {
            do { i++; } while (nums[i] < pivot);
            do { j--; } while (nums[j] > pivot);

            if (i < j) {
                std::swap(nums[i], nums[j]);
            }
        }

        sort(nums, left, j);
        sort(nums, j + 1, right);
    }

public:
    void sortArray(std::vector<int>& nums) {
        sort(nums, 0, nums.size() - 1);
    }
};

// 或者用函数模板实现
template<typename T>
void quick_sort(std::vector<T>& array, int left, int right) {
    if (left >= right) return;

    T pivot = array[(left + right) / 2];
    int i = left - 1;
    int j = right + 1;

    while (i < j) {
        do { i++; } while (array[i] < pivot);
        do { j--; } while (array[j] > pivot);

        if (i < j) {
            std::swap(array[i], array[j]);
        }
    }

    quick_sort(array, left, j);
    quick_sort(array, j + 1, right);
}

int main() {
    int n;
    std::cin >> n;

    std::vector<int> numbers(n);
    for (int i = 0; i < n; i++) {
        std::cin >> numbers[i];
    }

    // 方法1：使用类
    QuickSort sorter;
    sorter.sortArray(numbers);

    // 方法2：使用模板函数
    // quick_sort(numbers, 0, n - 1);

    // 方法3：使用STL
    // std::sort(numbers.begin(), numbers.end());

    for (const int& num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    return 0;
}
```
