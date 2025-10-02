#!/bin/bash

echo "🚀 启动汉字学习系统本地服务器..."
echo ""

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "💡 请先安装 Node.js: https://nodejs.org/"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

# 检查是否安装了 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    echo "💡 请先安装 npm (通常随 Node.js 一起安装)"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

# 检查是否存在 package.json
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到 package.json 文件"
    echo "💡 请确保在项目根目录下运行此脚本"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖包..."
    npm install
    echo ""
fi

# 启动服务器
echo "🎯 启动开发服务器..."
echo ""
npm start
