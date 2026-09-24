---
doc_type: issue-fix
issue: 2026-09-05-android-back
path: fast-track
fix_date: 2026-09-05
status: awaiting-device-verification
tags: [android, navigation, keyboard]
---

# Android 返回层级

## 原因

页面内选择窗口由 React 状态控制，不是 WebView 历史页面；原生返回未对接这些状态，最终结束 Activity。

## 返回规则

1. 输入法可见：先隐藏输入法。
2. 选择弹窗或侧栏可见：关闭最上层，同时取消其中输入框焦点。
3. 没有弹窗但输入框选中：blur 提交数值并取消焦点。
4. 伤害计算、速度推算、速攻值推算、角色装备为一级页面：显示原生“是否退出 Epic7 Calc？”对话框，取消留下，确认才 finish。

## 实现

- MainActivity.kt 注册 OnBackPressedCallback，检查 IME，调用网页返回处理函数；网页未消费才显示 AlertDialog。没有编辑 generated 目录下的 WryActivity/TauriActivity。
- src/mobileBack.ts 通过已有遮罩关闭回调解除当前窗口，App.tsx 注册该函数。网页未就绪时保守消费返回，不直接退出。
- scripts/test-mobile-back.mjs 覆盖主页面、抽屉、头像/神器检索、输入焦点、装备选角。
- 版本升为 0.1.4，属于移动平台专有修复，不写入 Windows 计算器。

## 验证

浏览器返回层级测试和 116 项移动测试通过。Android 原生编译、v2/v3 签名及 ZIP 对齐检查通过。产物 release/Epic7-Calc-Mobile-v0.1.4-arm64.apk，SHA256 214ECA317BD29004D0C41D35FE23756B05F57C5DF02096F54BBDCE7041D9EC6C。实际系统手势、输入法隐藏和原生确认框仍需要设备复测，不能用浏览器测试替代。
