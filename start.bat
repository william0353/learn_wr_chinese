@echo off
setlocal EnableDelayedExpansion

echo 🚀 启动汉字学习系统本地服务器...
echo.

REM 检查是否安装了 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js
    echo 💡 请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 检查是否安装了 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm
    echo 💡 请先安装 npm (通常随 Node.js 一起安装)
    echo.
    pause
    exit /b 1
)

REM 检查是否存在 package.json
if not exist "package.json" (
    echo ❌ 错误: 未找到 package.json 文件
    echo 💡 请确保在项目根目录下运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 正在安装依赖包...
    call npm install
    echo.
)

REM 启动服务器
echo 🎯 启动开发服务器...
echo.
call npm start
