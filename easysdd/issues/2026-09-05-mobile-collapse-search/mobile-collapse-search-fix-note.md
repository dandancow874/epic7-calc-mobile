---
doc_type: issue-fix
issue: 2026-09-05-mobile-collapse-search
path: fast-track
fix_date: 2026-09-05
status: awaiting-device-verification
tags: [android, mobile, accordion, search]
---

# 手机折叠与搜索布局修复

## 1. 问题描述

MuMu 1440×2560、640 DPI 测试时默认展开，摘要与角色头部重复，点击不能收起；用户报告搜索结果不可见（仅收到第一张重复头部截图）。目标为常见手机，不针对模拟器物理分辨率写死布局。

## 2. 根因

- CalculatorWorkspace 的初始 expandedSide 为 attacker，点击只设置相同 side，不存在 null 关闭状态。
- summary 和 panel-head 同时可见。
- mobile.css 的弹窗容器选择器没有包含实际使用的 modal-scrim，继承桌面的 130px 顶部空白；列表沿用固定最大高度，父容器裁剪会影响小高度显示。
- 600px 断点取消了折叠，与用户要求不符。

## 3. 修复方案

双方初始关闭，允许关闭当前方，展开另一方自动关闭原方；展开后隐藏摘要，只显示原角色头部和独立收起按钮。移动端所有宽度保留折叠。弹窗采用动态视口高度、顶部搜索框和 flex 剩余空间滚动列表；Android activity 设置 adjustResize。

## 4. 改动文件清单

- src/CalculatorWorkspace.tsx、src/mobile.css。
- src-tauri/gen/android/app/src/main/AndroidManifest.xml。
- scripts/test-mobile-layout.mjs：浏览器回归测试。
- package.json、package-lock.json、src-tauri/Cargo.toml、Cargo.lock、tauri.conf.json：版本 0.1.1。
- 主仓库 e7-tools 同步共享 CalculatorWorkspace 折叠状态和按钮；style.css 隐藏移动按钮，保持桌面布局。未修改伤害公式。

## 5. 验证结果

移动仓库 116 项、主仓库 131 项测试通过。浏览器测试 360、384、412、480、600、720px：默认关闭、展开、关闭、互斥、搜索选择全部通过。将高度降至 360px 后搜索首条结果仍完整可见，无页面横向溢出。已查看 360px 启动截图，双方折叠且技能结果可见。

## 6. 遗留事项

浏览器缩短高度不等于真实 Android 输入法验证；adb 未连接设备。需用户覆盖安装 0.1.1 后验证 MuMu/真机键盘及搜索效果。没有用户验收结论，不标记完整闭环。
