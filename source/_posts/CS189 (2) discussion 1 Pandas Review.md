---
title: "CS189 (2) discussion 1 Pandas Review"
date: 2025-10-05 21:02:15
updated: 2025-10-05 21:02:15
zhihu_url: "https://zhuanlan.zhihu.com/p/1958275619541456770"
zhihu_id: "1958275619541456770"
math: true
---
### Q 1.1

How many columns are in the `title_basics` `DataFrame`? What is the data type of the startYear column? Does this make sense?

```python
title_basics.info()
```

### Q 1.2

What is the value in 101st row of the `primaryTitle` column of the `title_basics` `DataFrame`? *HINT: Recall that* `DataFrame` *uses 0-indexing*

```python
# 语法: df.loc[行标签, 列标签]
value = title_basics.loc[100, "primaryTitle"]
print(value)

# 另一种写法 title_basics['primaryTitle'][100]
```

### Q 1.3

Display the first 3 rows and the last 6 rows of the `title_basics` `DataFrame` as a single `DataFrame`.

```python
pd.concat([title_basics.head(3), title_basics.tail(6)])

# pd.concat([title_basics.iloc[:3], title_basics[-6:]])
```

### Q1.4

How many unique `titleTypes` are there in the `title_basics` `DataFrame`? Which is the most common

```python
title_basics['titleType'].value_counts()
```

### Q1.5

Remove the `originalTitle` and `endYear` columns from the `title_basics` `DataFrame`. Make sure that the columns are permanently removed from the `title_basics` `DataFrame`

```python
title_basics.drop(columns=['originalTitle', 'endYear'], inplace = True);

title_basics.head(
```

### Q1.6

Rename `primaryTitle` to `title` and `startYear` to `year` in the `title_basics` `DataFrame`. Make sure that the changes are reflected permanently in the `title_basics` `DataFrame`

```python
title_basics = title_basics.rename(columns={'primaryTitle' : 'title', 'startYear' : 'year'})

title_basics.head()
```

### Q1.7

A crucial step in most data processing pipelines for machine learning is dealing with missing or corrupted data. Often, these missing values are represented as a `NaN` (not a number). Sometimes in the context of machine learning we'd want to estimate a value for a missing feature rather than remove that sample point entirely. Can you think of some simple ways in which we could perform that estimation?

使用平均值、中位数、邻近数进行插值处理

### Q1.8

Remove all rows from the `title_basics` `DataFrame` where `runtimeMinutes` or `year` is \`NaNo

```python
initial_length = title_basics.shape[0]
title_basics = title_basics.dropna(subset=['runtimeMinutes', 'year'])
final_length = title_basics.shape[0]
print(f"{initial_length - final_length} rows removed from dataframe")
```

### Q1.9

Change the data type of the `year` column in the `title_basics` `DataFrame` to something that makes more sense. Then confirm that the change is permanently applied.

```python
title_basics['year'] = title_basics['year'].astype(int)

title_basics['year'].dtype
```

Let's practice some more basic filtering and sorting now.

### Q1.10

Extract the feature films (`titleType == "movie"`) released in 1954 from the `title_basics` `DataFrame` (save this as a new `DataFrame`, `feature_films_1954`).

```python
feature_films_1954 = title_basics[(title_basics['titleType'] == 'movie') & (title_basics['year'] == 1954)]
feature_films_1954.head(
```

### Q1.11

Among the feature films from 1954, which film has the longest runtime? Return its `title` and `runtimeMinutes` as a `DataFrame` extracted from the `feature_films_1954` `DataFrame`.

```python
feature_films_1954.sort_values(by='runtimeMinutes', ascending=False).iloc[0][['title', 'runtimeMinutes']]
```

### Q2.1

For each `genre` in the `title_basics` `DataFrame`, compute the mean runtime of feature films released since 1960.

Show the five longest-mean genres.

```python
title_basics[title_basics['year'] >= 1960].groupby('genres')['runtimeMinutes'].mean().sort_values(ascending=False).head()
```

### Q2.2

Merge the `title_ratings` `DataFrame` with the `title_basics` `DataFrame` by joining on the `tconst` column. How many titles are present in the `title_basics` `DataFrame` but not in the `title_ratings` `DataFrame`? Store the merged `DataFrame` as `merged_df`. **Hint:** Recall that because of the genre splitting, the number of titles is not equal to the number of rows.

```python
n_titles_basics = title_basics.groupby('tconst').any().shape[0]
merged_df = pd.merge(title_basics, title_ratings, on='tconst', how='inner')
print(merged_df.head())
n_titles_merged = merged_df.groupby('tconst').any().shape[0]
print(f"\nNumber of titles in basics but not in ratings: {n_titles_basics - n_titles_merged}")
```

### Q2.3

Using the `merged_df` `DataFrame` and plotly express, create an interactive scatter plot of the `runtimeMinutes` vs. `numVotes` for movies in the `merged_df` `DataFrame`. Color the points by the `year` of the movie and add a title and axis labels to the plot. Also, make sure the movie title is visible when hovering over the data points. **Note:** To make the data easier to visualize, we take a sample of just 2000 movies. That's why you may not see your favorites on this plot. It's important not to change the random state as you'll end up getting different results for the following questions.

```python
sampled_df = merged_df[merged_df['titleType'] == 'movie'].sample(n=2000, random_state=SEED)
px.scatter(sampled_df, x='runtimeMinutes', y='numVotes', color='year', hover_data=['title'],
title='Number of Votes vs. Runtime, IMDb Movies',
labels={'runtimeMinutes': 'Runtime (minutes)', 'numVotes': 'Number of Votes', 'year': 'Year of Release'})
```

### Part 3: Finding the perfect movie

Aakarsh has spent his whole summer brainrotting and doomscrolling, so now his attention span is COOKED. He wants to pick a movie to watch tonight but wants to make sure it isn't so long he gets bored. He decides to construct a Brainrot Score (BRS) to help him find the perfect movie: $BRS = \frac{\text{averageRating}}{\sqrt{\text{runtimeMinutes}}}$ He also wants to make sure the following criteria hold: - The title should be a *movie* made in 1980 or later. - It must have at least 10000 votes. - It must be in the `History`, `Thriller`, or `Comedy` genres. Can you help Aakarsh out by finding the 3 best movies by BRS in each of his preferred genres?

```python
# Filter step
filtered = merged_df[(merged_df['titleType'] == 'movie') &
(merged_df['year'] >= 1980) &
(merged_df['genres'].isin(['History', 'Thriller', 'Comedy'])) &
(merged_df['numVotes'] >= 10000)
]
# Calculate BRS
filtered['BRS'] = filtered['averageRating'] / np.sqrt(filtered['runtimeMinutes'])
# Sort and group by genres
selections = (filtered.sort_values(by='BRS', ascending=False)
.groupby('genres')
.head(3))
selections.head(9)
```
