@echo off
echo 感知之门自然探索应用启动脚本
echo ================================

echo 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js环境正常

echo 安装依赖包...
call npm install

if %errorlevel% neq 0 (
    echo 错误: 依赖包安装失败
    pause
    exit /b 1
)

echo 依赖包安装完成

echo 启动服务器...
echo.
echo 应用将在以下地址运行:
echo 主应用: http://localhost:8080
echo 后台管理: http://localhost:8080/admin.html
echo 功能测试: http://localhost:8080/test.html
echo.
echo 按 Ctrl+C 停止服务器
echo.

node server.js

pause