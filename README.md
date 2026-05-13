<table align="center"><tr><td align="center" width="9999">
<img src="docs/images/logo.svg" align="center" width="150" alt="Project icon">

# Viridian Desk

<h3>A secure desktop client for VDI cloud desktops, virtual applications, and remote applications.</h3>
<div align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen">
  <img src="https://img.shields.io/badge/rust-1.70+-orange">
  <img src="https://img.shields.io/badge/tauri-2.x-blue">
  <img src="https://img.shields.io/badge/react-18.x-61dafb">
  <img src="https://img.shields.io/badge/license-MIT-green">

  <p align="center"><a href="README.zh-CN.md">中文</a> | English</p>
</div>
</td></tr></table>

## 📖 Overview

**Viridian Desk** is a lightweight, secure desktop application that enables ordinary users to connect to their VDI (Virtual Desktop Infrastructure) cloud desktops, virtual applications, and remote applications. The client requires user authentication before establishing any connection, ensuring secure access to enterprise virtual resources.

Built with **Tauri** and **React**, Viridian Desk offers a small footprint, excellent performance, and cross-platform support for Windows, macOS, and Linux.

### Use Cases

- **Remote Work** – Access your office desktop from home
- **BYOD Environments** – Securely connect personal devices to corporate resources
- **Virtual Apps** – Run remote applications without full desktop virtualization
- **IT Managed Services** – Provide clients with easy access to virtual workspaces

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| **VDI Connection** | Connect to mainstream VDI cloud desktops |
| **Virtual Apps** | Launch remote and virtual applications seamlessly |
| **Remote App Support** | Run individual applications without full desktop |
| **User Authentication** | Login required before any connection |
| **Connection Profiles** | Save and manage multiple connection configurations |
| **Tray Integration** | Quick access and connection status from system tray |
| **Auto Update** | Seamless background updates |
| **Cross Platform** | Windows, macOS, and Linux support |

### Planned Features

- [ ] Multi-factor authentication (MFA) support
- [ ] Session recording
- [ ] Clipboard sync between local and remote
- [ ] USB redirection
- [ ] Multi-monitor support

---

## 📸 Screenshots

<p align="center">
  <i>Screenshots will be added after initial release</i>
</p>

| Login | Dashboard | Connected |
| :---: | :---: | :---: |
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Connected](docs/screenshots/connected.png) |

---

## 📥 Download

Download the latest version for your platform from the [Releases](https://github.com/YOUR_USERNAME/viridian-desk/releases) page.

| Platform | Format | Download |
| :--- | :--- | :--- |
| **Windows** | `.msi` / `.exe` | [Download](https://github.com/YOUR_USERNAME/viridian-desk/releases/latest) |
| **macOS** | `.dmg` (Intel) / `.dmg` (Apple Silicon) | [Download](https://github.com/YOUR_USERNAME/viridian-desk/releases/latest) |
| **Linux** | `.deb` / `.AppImage` / `.rpm` | [Download](https://github.com/YOUR_USERNAME/viridian-desk/releases/latest) |

### System Requirements

| Platform | Minimum Requirements |
| :--- | :--- |
| **Windows** | Windows 10 (64-bit) / Windows 11 |
| **macOS** | macOS 11 (Big Sur) or later |
| **Linux** | Ubuntu 20.04+, Fedora 36+, or any distribution with GLIBC 2.31+ |
| **RAM** | 2GB (4GB recommended) |
| **Disk** | 200MB free space |
| **Network** | Stable internet connection |

---

## 🚀 Quick Start

### 1. Install

Download the installer for your platform and run it.

### 2. Launch

Open Viridian Desk from your applications menu or desktop shortcut.

### 3. Login

Enter your credentials provided by your IT administrator.

### 4. Connect

After successful login, you'll see your available VDI desktops and virtual applications. Click **Connect** to start your session.

### 5. System Tray

Viridian Desk runs in the system tray. Right-click the icon for quick actions:

- **Show Window** – Bring the main window to front
- **Connect to [Profile]** – Quick connect to saved profiles
- **Disconnect** – End current session
- **Quit** – Exit the application

---

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Rust](https://www.rust-lang.org/) 1.70 or later
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/viridian-desk.git
cd viridian-desk

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```
