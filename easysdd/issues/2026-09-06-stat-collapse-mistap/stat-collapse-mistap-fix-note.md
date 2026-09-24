---
doc_type: issue-fix
issue: 2026-09-06-stat-collapse-mistap
path: fast-track
fix_date: 2026-09-06
status: awaiting-device-verification
tags: [mobile, touch, slider]
---

# 数值行空白收起误操作

## 问题与根因

用户在收起手机端角色面板时偶发修改攻击或减伤。StatField 用 label 包裹滑块和文本输入，行内文字与空白具有隐式激活第一个控件的行为，同时被收起处理的 label 排除规则拦住。修复前触摸回归在“攻击文字必须收起”断言失败。尚未在真机上复现用户的随机数值跳变，之前猜测的布局点击穿透未证实。

## 已确认方案

用户同意将数值行空白与真实控件分开。StatField 改为 div/role=group，滑块及数字输入分别提供 aria-label。空白收起 click 阻止默认行为和冒泡；不改真实控件事件，不在 pointerdown 提前折叠。

## 文件

- src/CalculatorWorkspace.tsx
- scripts/test-mobile-stat-collapse.mjs
- 本记录

没有修改计算公式、样式、主项目和 Windows 版本，没有引入新的业务抽象。

## 验证

- npm run build 通过。
- 26 个测试文件、116 项单元测试全部通过。
- 新触摸回归在 360/412/480 CSS px 通过：攻击、减伤文字与上下空白收起后数值不变；直接滑块点击、键盘调整、文本输入仍工作。
- 原移动布局测试在 360/384/412/480/600/720 CSS px 验证折叠、切换展开方、搜索与键盘缩小高度。
- 真机验收待用户复测；本轮未生成新 APK，已安装版本不会自动包含修复。

## 后续维护

共享同步脚本会覆盖 CalculatorWorkspace.tsx；从主项目同步后必须运行本次触摸回归，避免重新引入整行 label。本次仅按授权修改 mobile，未同步主项目。待用户确认后再决定提交或打包。
