---
doc_type: issue-fix
issue: 2026-09-05-collapse-hit-area
path: fast-track
fix_date: 2026-09-05
status: awaiting-device-verification
tags: [mobile, touch, accordion]
---

# 角色收起点击区域修复

## 0.1.5 补充

按用户新要求取消 panel-head 限制：展开面板全部非交互空白处（包括中部、底部）点击都收起。按钮、输入、链接、标签、role=button/slider 和可编辑区域不触发。处理函数更名 collapseFromBlankArea，并同步主仓库以避免下次覆盖回旧行为。360–720px 的底部空白真实点击测试通过，116 项测试通过。

## 问题与根因

展开按钮覆盖完整摘要，但收起按钮宽度仅为文字宽度，展开后的头部空白也没有点击处理。

## 修复

mobile.css 将收起按钮扩展为全宽 44px 横栏。CalculatorWorkspace 在角色头部空白点击时收起，排除 button/input/select/textarea/a/label，保留选角、神器、别名及等级输入原有操作。非头部的属性区域不触发收起。共享处理同步到 e7-tools，桌面不显示移动收起横栏。

## 验证

360/384/412/480/600/720px 浏览器测试通过，涵盖头部空白收起、横栏左侧空白收起、等级输入不收起，以及原有展开/收起/搜索回归。移动仓库 116 项测试通过。版本 0.1.3；设备触控验收待用户确认。

## 文件

- src/CalculatorWorkspace.tsx（移动和主仓库）
- src/mobile.css
- scripts/test-mobile-layout.mjs
- package.json/package-lock.json、Rust/Tauri 版本配置
