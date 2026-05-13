<table align="center"><tr><td align="center" width="9999">
<img src="docs/images/logo.svg" align="center" width="150" alt="Project icon">

# Viridian Desk

<h3>安全的 VDI 云桌面、虚拟应用与远程应用桌面客户端</h3>
<div align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen">
  <img src="https://img.shields.io/badge/rust-1.70+-orange">
  <img src="https://img.shields.io/badge/tauri-2.x-blue">
  <img src="https://img.shields.io/badge/react-18.x-61dafb">
  <img src="https://img.shields.io/badge/license-MIT-green">

  <p align="center">中文 | <a href="README.md">English</a></p>
</div>
</td></tr></table>

## 📖 项目概述

**Viridian Desk** 是一款轻量级、安全的桌面应用程序，让普通用户能够安全连接自己的 VDI（虚拟桌面基础设施）云桌面、虚拟应用和远程应用。客户端在建立任何连接之前都需要用户授权登录，确保企业虚拟资源的安全访问。

基于 **Tauri** 和 **React** 构建，Viridian Desk 具有体积小、性能优越、跨平台等优点，支持 Windows、macOS 和 Linux。

### 适用场景

- **远程办公** – 从家中访问办公室桌面
- **BYOD 环境** – 将个人设备安全连接到企业资源
- **虚拟应用** – 运行远程应用程序，无需完整桌面虚拟化
- **IT 托管服务** – 为客户提供便捷的虚拟工作区访问入口

---

## ✨ 功能特性

| 功能 | 说明 |
| :--- | :--- |
| **VDI 连接** | 连接主流 VDI 云桌面 |
| **虚拟应用** | 无缝启动远程和虚拟应用程序 |
| **远程应用支持** | 运行单个应用，无需完整桌面 |
| **用户认证** | 连接前必须登录授权 |
| **连接配置** | 保存和管理多个连接配置 |
| **系统托盘集成** | 从系统托盘快速访问并查看连接状态 |
| **自动更新** | 无缝的后台更新 |
| **跨平台** | 支持 Windows、macOS 和 Linux |

### 计划中的功能

- [ ] 多因素认证（MFA）支持
- [ ] 会话录制
- [ ] 本地与远程剪贴板同步
- [ ] USB 重定向
- [ ] 多显示器支持

---

## 📸 截图

<p align="center">
  <i>截图将在首次发布后补充</i>
</p>

| 登录界面 | 主界面 | 已连接 |
| :---: | :---: | :---: |
| ![登录界面](docs/screenshots/login.png) | ![主界面](docs/screenshots/dashboard.png) | ![已连接](docs/screenshots/connected.png) |

---

## 📥 下载

从 [Releases](https://github.com/你的用户名/viridian-desk/releases) 页面下载最新版本。

| 平台 | 格式 | 下载 |
| :--- | :--- | :--- |
| **Windows** | `.msi` / `.exe` | [下载](https://github.com/你的用户名/viridian-desk/releases/latest) |
| **macOS** | `.dmg`（Intel）/ `.dmg`（Apple Silicon） | [下载](https://github.com/你的用户名/viridian-desk/releases/latest) |
| **Linux** | `.deb` / `.AppImage` / `.rpm` | [下载](https://github.com/你的用户名/viridian-desk/releases/latest) |

### 系统要求

| 平台 | 最低要求 |
| :--- | :--- |
| **Windows** | Windows 10（64位）/ Windows 11 |
| **macOS** | macOS 11（Big Sur）或更高版本 |
| **Linux** | Ubuntu 20.04+、Fedora 36+ 或 GLIBC 2.31+ 的发行版 |
| **内存** | 2GB（建议 4GB） |
| **硬盘** | 200MB 可用空间 |
| **网络** | 稳定的互联网连接 |

---

## 🚀 快速开始

### 1. 安装

下载对应平台的安装程序并运行。

### 2. 启动

从应用程序菜单或桌面快捷方式打开 Viridian Desk。

### 3. 登录

输入 IT 管理员提供的凭证。

### 4. 连接

登录成功后，您将看到可用的 VDI 桌面和虚拟应用列表。点击 **连接** 开始会话。

### 5. 系统托盘

Viridian Desk 会在系统托盘中运行。右键单击图标可执行快速操作：

- **显示窗口** – 将主窗口置于前台
- **连接到 [配置]** – 快速连接到已保存的配置
- **断开连接** – 结束当前会话
- **退出** – 退出应用程序

---

## 🛠️ 开发指南

### 前置条件

- [Node.js](https://nodejs.org/) 18 或更高版本
- [Rust](https://www.rust-lang.org/) 1.70 或更高版本
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### 环境搭建

```bash
# 克隆仓库
git clone https://github.com/你的用户名/viridian-desk.git
cd viridian-desk

# 安装依赖
pnpm install

# 以开发模式运行
pnpm tauri dev
```
