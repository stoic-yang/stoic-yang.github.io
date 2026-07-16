'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const publicRoot = path.join(projectRoot, 'public');
const postsRoot = path.join(projectRoot, 'source', '_posts');
const problems = [];

function walk(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) return [];

  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(target, predicate));
    } else if (predicate(target)) {
      files.push(target);
    }
  }
  return files;
}

function validatePost(postPath) {
  const source = fs.readFileSync(postPath, 'utf8');
  const relativePath = path.relative(projectRoot, postPath);
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!frontmatter) {
    problems.push(`${relativePath}: 缺少 YAML frontmatter`);
  } else if (!/^date:\s*\S+/m.test(frontmatter[1])) {
    problems.push(`${relativePath}: 缺少 date 属性`);
  }

  let fence = '';
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (fence === fenceMatch[1][0]) fence = '';
      continue;
    }
    if (fence) continue;

    const withoutInlineCode = line.replace(/`[^`]*`/g, '');
    if (withoutInlineCode.includes('![[')) {
      problems.push(`${relativePath}:${index + 1}: 存在无法由 Hexo 渲染的 Obsidian 图片嵌入`);
    }
  }
}

function localTargetExists(htmlPath, rawReference) {
  if (!rawReference || /^(?:[a-z]+:|\/\/|#)/i.test(rawReference)) return true;

  let url;
  try {
    const relativeHtml = path.relative(publicRoot, htmlPath).split(path.sep).join('/');
    url = new URL(rawReference, `https://local.invalid/${relativeHtml}`);
  } catch {
    return false;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    pathname = url.pathname;
  }

  const candidate = path.resolve(publicRoot, `.${pathname}`);
  if (!candidate.startsWith(`${publicRoot}${path.sep}`) && candidate !== publicRoot) return false;

  const targets = [candidate];
  if (pathname.endsWith('/') || !path.extname(candidate)) {
    targets.push(path.join(candidate, 'index.html'));
  }
  return targets.some(target => fs.existsSync(target));
}

if (!fs.existsSync(publicRoot)) {
  problems.push('public/: 站点尚未生成，请先运行 npm run build');
}

const postFiles = walk(postsRoot, file => path.extname(file) === '.md' && path.dirname(file) === postsRoot);
for (const postPath of postFiles) validatePost(postPath);

const htmlFiles = walk(publicRoot, file => path.extname(file) === '.html');
const attributePattern = /\b(?:href|src)=(?:"([^"]+)"|'([^']+)')/g;
for (const htmlPath of htmlFiles) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  let match;
  while ((match = attributePattern.exec(html))) {
    const reference = match[1] || match[2];
    if (!localTargetExists(htmlPath, reference)) {
      problems.push(`${path.relative(projectRoot, htmlPath)}: 本地引用不存在 ${reference}`);
    }
  }
}

if (fs.existsSync(path.join(publicRoot, '1970'))) {
  problems.push('public/1970/: 存在缺少有效日期的文章');
}

if (problems.length > 0) {
  console.error(`站点校验失败，共 ${problems.length} 项：`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`站点校验通过：${postFiles.length} 篇文章，${htmlFiles.length} 个 HTML 页面，本地引用完整。`);
}
