---
title: "CS189 (1) data tool"
date: 2025-10-05 19:48:56
updated: 2025-10-05 19:48:57
zhihu_url: "https://zhuanlan.zhihu.com/p/1958256393778893389"
zhihu_id: "1958256393778893389"
---
### 之前学过数据分析课，也看过一点data100，快速过一下

### Creating an Interactive Scatter Plot with Plotly Express

Plotly express is closely related to Pandas Plotting, but it is a separate library that provides a high-level interface for creating plots. It is designed to work seamlessly with `pandas` `DataFrames` and provides a simple API for creating a wide range of visualizations. Plotly express offers more flexibility and customization options than `pandas` plotting, making it a powerful tool for creating complex visualizations. **Key components:** 1. `**px.scatter**`: Generates a scatter plot to visualize relationships between two numerical variables. 2. **Parameters**: - `**mpg**`: Dataset containing car information. - `**x='weight'**`: X-axis represents car weight. - `**y='mpg'**`: Y-axis represents miles per gallon. - `**color='origin'**`: Groups points by car origin. - `**size='cylinders'**`: Marker size reflects the number of cylinders. - `**size_max=12**`: Limits marker size. - `**hover_data=mpg.columns**`: Displays all dataset columns on hover. - `**title='MPG vs. Weight by Origin'**`: Adds a plot title. - `**labels={'weight': 'Weight (lbs)', 'mpg': 'Miles Per Gallon (MPG)'}**`: Customizes axis labels. - `**width=800, height=600**`: Sets plot dimensions.

All the basic plotting functions in `pandas` and `plotly express` return `Figure` objects, which can be further customized using the methods available in the `plotly.graph_objects` module. We can use `update_layout` to update some parameters in the figure.

```python
fig = px.scatter(mpg, x='weight', y='mpg', color='origin',
                 hover_data=mpg.columns,
                 animation_frame='model year',
                 title='MPG vs. Weight by Origin',
                 labels={'weight': 'Weight (lbs)', 'mpg': 'Miles Per Gallon (MPG)'},
                 width=800, height=600)
fig.update_layout(
    xaxis_title='Weight (lbs)',
    yaxis_title='Miles Per Gallon (MPG)',
    xaxis_range=[1500, 5000],
    yaxis_range=[10, 50],
    legend_title_text='Origin',
)
fig.show()
```

We can also save plots to HTML files, which can be shared and embedded in web applications. This is useful for creating interactive reports and dashboards.

```bash
fig.write_html('mpg_scatter.html', include_plotlyjs='cdn')
fig.write_image('mpg_scatter.png', scale=2, width=800, height=600)
fig.write_image('mpg_scatter.pdf', scale=2, width=800, height=600)
```

The figure object is made of two key components: - the **data** and - the **layout**.

The data is a list of traces, which are the individual plots that make up the figure. The layout is a dictionary that contains information about the appearance of the plot, such as the title, axis labels, and legend.

### Using Plotly Graphics Objects

The Graphics objects are a more flexible and powerful interface that allows for fine-grained control over the appearance and behavior of plots. It is suitable for creating complex visualizations and custom layouts.

A Figure Graphic Object is composed of: - **Data:** A list of traces (e.g., Scatter, Lines, Annotations) - **Layout:** A dictionary describing the overall layout (e.g., title, axis properties, …)

### Visualizing Different Kinds of Data

Now that we have seen the basics of using Plotly, let's explore how to visualize different kinds of data.

```python
yearly_mpg = (
    mpg
    .groupby(['origin', 'model year'])
    [['mpg', 'displacement', 'weight']]
    .mean().reset_index()
)
yearly_mpg.head()

px.scatter(yearly_mpg, x='model year', y='mpg', color='origin',

title='Average MPG by Model Year and Origin',

width=800, height=600)
```

!\[\[newplot.png\]\]
