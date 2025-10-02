# 汉字学习系统 - 本地开发指南

## 🚀 快速开始

### 方法1: 一键启动 (推荐)

#### Windows 用户
双击 `start.bat` 文件即可自动启动服务器

#### macOS/Linux 用户
```bash
chmod +x start.sh
./start.sh
```

### 方法2: 手动启动

1. **安装依赖** (首次运行)
```bash
npm install
```

2. **启动服务器**
```bash
npm start
# 或者
node server.js
```

3. **访问系统**
打开浏览器访问: http://localhost:8000

## 📋 系统要求

- Node.js (版本 >= 14.x)
- npm (通常随 Node.js 一起安装)

## 🔧 安装 Node.js

### Windows
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本
3. 运行安装程序，按提示完成安装

### macOS
```bash
# 使用 Homebrew (推荐)
brew install node

# 或者从官网下载安装包
# https://nodejs.org/
```

### Linux (Ubuntu/Debian)
```bash
# 更新包索引
sudo apt update

# 安装 Node.js 和 npm
sudo apt install nodejs npm

# 验证安装
node --version
npm --version
```

## 🌐 访问地址

服务器启动后，可以访问以下页面:

- **首页**: http://localhost:8000/index.html
- **学习页**: http://localhost:8000/learn.html  
- **测试页**: http://localhost:8000/exam.html
- **练习册**: http://localhost:8000/sheet.html
- **使用说明**: http://localhost:8000/usage_guide.html
- **数据管理**: http://localhost:8000/data_manager.html

## 📁 项目结构

```
LearnChineseVue/
├── server.js           # Node.js 服务器
├── package.json        # 项目配置
├── start.sh           # macOS/Linux 启动脚本
├── start.bat          # Windows 启动脚本
├── index.html         # 首页
├── learn.html         # 学习页面
├── exam.html          # 测试页面
├── sheet.html         # 练习册页面
├── usage_guide.html   # 使用说明
├── data_manager.html  # 数据管理
├── js/
│   ├── simpleDB.js    # IndexedDB 操作库
│   └── curve.js       # 记忆曲线算法
├── data/
│   ├── word.json      # 汉字数据
│   └── lesson_index.json # 课程索引
├── img/               # 图片资源
└── sound/             # 音频资源
```

## 🛠️ 开发功能

### 跨域支持
- 服务器自动处理 CORS，支持所有前端 AJAX 请求
- 无需修改任何现有代码

### 静态文件服务
- 自动设置正确的 MIME 类型
- 支持 HTML、CSS、JS、JSON、MP3 等文件

### API 接口
- `GET /api/words` - 获取汉字数据
- `GET /api/lessons` - 获取课程数据

### 热重载
修改文件后需要手动刷新浏览器 (Ctrl+F5 或 Cmd+R)

## 🐛 常见问题

### 端口被占用
如果 8000 端口被占用，可以：
1. 修改 `server.js` 中的 `PORT` 变量
2. 或者使用环境变量: `PORT=3000 npm start`

### 找不到文件
确保在项目根目录 (包含 package.json 的目录) 下运行命令

### 依赖安装失败
```bash
# 清除缓存重试
npm cache clean --force
npm install
```

## 🚀 部署到生产环境

生产环境建议使用专业的 Web 服务器 (如 Nginx、Apache) 或云服务平台。

本地开发服务器仅用于开发和调试，不适合生产使用。

## 📞 技术支持

如有问题或建议，欢迎联系:
- 微信号: william0353

---

**最后更新**: 2024年10月2日
