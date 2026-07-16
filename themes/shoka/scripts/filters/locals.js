/* global hexo */

'use strict';

const path = require('path');
const url = require('url');

const fmtNum = num => {
  return num < 10 ? '0' + num : num;
};


hexo.extend.filter.register('template_locals', locals => {
  const { env, config } = hexo;
  const { __, theme } = locals;
  const { i18n } = hexo.theme;

  var pangu = theme.pangu ? require('pangu') : {
    spacing: data => {
      return data;
    }
  };

  // Language & Config
  locals.alternate = theme.alternate;
  locals.title = pangu.spacing(__('title') !== 'title' ? __('title') : config.title);
  locals.subtitle = pangu.spacing(__('subtitle') !== 'subtitle' ? __('subtitle') : config.subtitle);
  locals.author = __('author') !== 'author' ? __('author') : config.author;
  locals.description = pangu.spacing(__('description') !== 'description' ? __('description') : config.description);
  locals.languages = [...i18n.languages];
  locals.languages.splice(locals.languages.indexOf('default'), 1);
  locals.page.lang = locals.page.lang || locals.page.language;
  locals.hostname = url.parse(config.url).hostname || config.url;

  // Creative Commons
  locals.ccURL = 'https://creativecommons.org/' + (theme.creative_commons.license === 'zero' ? 'publicdomain/zero/1.0/' : 'licenses/' + theme.creative_commons.license + '/4.0/') + (theme.creative_commons.language || '');

  if(locals.page.title) {
    locals.page.title = pangu.spacing(locals.page.title);
  }
  locals.page.lastcat = '';

  // 修改部分 - 开始
  if (locals.page.categories) {
    // 检查是否为数组或有 map 方法
    if (Array.isArray(locals.page.categories) || typeof locals.page.categories.map === 'function') {
      // 原来的代码
      locals.page.categories.map((cat) => {
        if(cat.name) {
          cat.name = locals.page.lastcat = pangu.spacing(cat.name);
        }
        return cat;
      });
    } else {
      // 如果不是数组但有 name 属性，将其转换为数组
      if (locals.page.categories.name) {
        const cat = locals.page.categories;
        locals.page.categories = [cat];
        cat.name = locals.page.lastcat = pangu.spacing(cat.name);
      } else {
        // 否则设为空数组
        locals.page.categories = [];
      }
    }
  }
  // 修改部分 - 结束

  if (locals.page.category) {
    locals.page.title = pangu.spacing(locals.page.category);
  }

  if (locals.page.month) {
    locals.page.month = fmtNum(locals.page.month);
  }

});
