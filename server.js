const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// 启用CORS
app.use(cors());

// 静态文件服务
app.use(express.static('.', {
  // 设置MIME类型
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
  }
}));

// API路由 - 获取汉字数据
app.get('/api/words', (req, res) => {
  try {
    const wordData = fs.readFileSync(path.join(__dirname, 'data', 'word.json'), 'utf8');
    res.json(JSON.parse(wordData));
  } catch (error) {
    console.error('读取汉字数据失败:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// API路由 - 获取课程索引
app.get('/api/lessons', (req, res) => {
  try {
    const lessonData = fs.readFileSync(path.join(__dirname, 'data', 'lesson_index.json'), 'utf8');
    res.json(JSON.parse(lessonData));
  } catch (error) {
    console.error('读取课程数据失败:', error);
    res.status(500).json({ error: '读取课程数据失败' });
  }
});

// 根路径重定向到首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '页面未找到' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 汉字学习系统本地服务器启动成功！');
  console.log('📍 服务器地址: http://localhost:' + PORT);
  console.log('📝 首页: http://localhost:' + PORT + '/index.html');
  console.log('📚 学习页: http://localhost:' + PORT + '/learn.html');
  console.log('✅ 测试页: http://localhost:' + PORT + '/exam.html');
  console.log('📄 练习册: http://localhost:' + PORT + '/sheet.html');
  console.log('❓ 使用说明: http://localhost:' + PORT + '/usage_guide.html');
  console.log('💾 数据管理: http://localhost:' + PORT + '/data_manager.html');
  console.log('');
  console.log('💡 提示: 按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 正在关闭服务器...');
  process.exit(0);
});
