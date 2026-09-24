# 移动版 0.1.2 修复记录

已生成 `release/Epic7-Calc-Mobile-v0.1.2-arm64.apk`，沿用原签名，v2/v3 签名及 ZIP 对齐检查通过。SHA256：75E304B198C790A1C26C5B97FAFD17854D01B37859DD3F57C99231ECF63C483E。

## 范围与原因

1. 侧栏被页面盖住：fixed 抽屉位于带 backdrop-filter 的顶栏内，受到父容器的定位与层叠上下文影响。现用 React portal 挂到 body，使用不透明底色，打开时锁定页面滚动。
2. 切换神器后跳输入框：共享 CalculatorWorkspace 中主动延迟 focus/select 神器等级。现删除这段行为，同时更新 e7-tools 主仓库，避免同步时重新引入。
3. 技能结果不够醒目、间距过大：移动卡片继承桌面 td 的 66px 高度。现取消固定单元格高度，使用蓝灰色背景与边框，减少空白。
4. 速度与速攻值超宽：输入网格依赖自动最小宽度，速攻值还使用 120/140/160px 桌面最小列宽。现使用 minmax(0,1fr)，结果移到输入行下方，计算结果卡也改单列。
5. 整体密度：缩小正文、数值字号，压缩字段、Buff、装备页间距，不通过页面 zoom 伪装适配。

## 文件

- src/components/app-shell/PrimaryNav.tsx
- src/CalculatorWorkspace.tsx（同步主仓库同一修复）
- src/mobile.css
- scripts/test-mobile-tools.mjs
- 版本文件：0.1.2

## 验证

- 移动仓库 116 项、主仓库 131 项测试通过。
- 浏览器 320/360/412/480/600px：抽屉覆盖层命中测试、速度/速攻值输入及结果实际边界、神器选择后不聚焦 input 均通过。
- 原折叠与搜索回归 360–720px 通过。
- 查看了 360px 的速度和速攻值截图，确认右侧内容完整、行距缩小。
- 无真机连接，Android 输入法、返回手势等仍需覆盖安装后实测。

## 同步边界

移动样式与抽屉保持在 epic7-calc-mobile。只将取消神器自动聚焦的共享行为写回 e7-tools；未修改伤害公式。没有自动发布 GitHub Release 或提交代码。
