---
doc_type: issue-fix
issue: 2026-09-06-slider-scroll
path: fast-track
fix_date: 2026-09-06
status: awaiting-device-verification
tags: [mobile, touch, slider, scroll]
---

# 纵向滚动误改角色数值

## 问题与运行时证据

移除数值行 label 后用户仍报告攻击、额外减伤跳变。使用 Chromium CDP 真实触摸序列，手指从额外伤害减少滑轨的 75% 位置开始向上滑动，复现 0 → 77。捕获事件顺序为 pointerdown → input(77) → pointermove → pointercancel → change(77)。数值在浏览器将手势交给页面滚动前已经提交，不是折叠后的点击穿透。诊断事件记录只在浏览器测试上下文中注册，未加入产品日志。

## 用户确认方案与实现

StatField 使用 ref 记录触摸起点与方向。手指刚按下、轻触、纵向移动和取消手势不提交 range input；被拒绝的原生值立即恢复为当前受控值。水平位移至少 8 CSS px 且超过垂直位移 1.5 倍时接受横向拖动。touch-action: pan-y 保留页面纵向滚动。松手和取消后继续拒绝尾随 change；下一次鼠标按下或键盘操作清除触摸限制。数字输入维持原行为。

## 改动文件

- src/CalculatorWorkspace.tsx（仅 StatField）
- scripts/test-mobile-slider-scroll.mjs（新增触摸序列回归）
- scripts/test-mobile-stat-collapse.mjs（更新轻触滑轨不修改数值的预期）
- 本记录

未修改公式、预设数据、主项目或 Windows 版本。

## 验证

- npm run build 通过。
- 116 项单元测试通过。
- 360/412/480 CSS px：攻击、额外伤害减少的按下、轻触、向上/向下滑动、touchCancel 均不变；横向拖动和数字输入有效。
- 独立鼠标上下文验证滑轨点击仍有效。
- 360/412/480 CSS px 原空白收起测试通过。

## 遗留事项

尚未重新打包 APK，手机安装版本暂不包含此修复；需要打包后真机复测。主项目同步会覆盖 CalculatorWorkspace.tsx，后续同步须保留本移动端手势处理并运行两份触摸回归。未提交 Git。
