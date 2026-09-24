# Epic7 Calc Mobile

《第七史诗》（Epic Seven）玩家自制 Android 计算工具，提供伤害计算、速度推算、速攻值推算和角色装备预设管理。

本项目由 `e7-tools` 派生，复用计算公式与角色、神器数据，并针对手机重新设计操作界面。**这是非官方工具，计算结果仅供参考，实际效果请以游戏为准。**

## 功能

- **伤害计算**：设置攻击方与防守方面板、神器、套装、专属装备及 Buff / Debuff，查看技能伤害和扣除护盾后的生命占比。
- **速度推算**：根据首轮行动条和已知速度推算速度区间。
- **速攻值推算**：设置角色速度与拉条、推条数值，查看行动条变化。
- **角色装备**：维护角色面板、套装、神器、刻印和装备预设，与计算页面联动。
- **本地保存**：保存装备预设及计算配置，无需注册账号。

### 手机操作

- 左上角菜单切换四个功能页面。
- 攻防角色默认折叠；展开一方时，另一方自动收起。
- 点击展开面板内的空白处可收起；按钮、输入框、滑块等控件保留原有操作。
- 支持角色名、英文名和别名检索。
- 返回时优先收起输入法、关闭选择窗口或侧栏、取消输入焦点；在一级页面返回会询问是否退出。

## 下载与安装

在本仓库的 **Releases** 页面下载 APK，无需下载整个源码仓库。

当前源码版本：**v0.1.7**。打包后的安装包名称为 `Epic7-Calc-Mobile-v0.1.7-arm64.apk`，已发布版本请以 Releases 为准。

| 项目 | 要求 |
| --- | --- |
| 系统 | Android 7.0 及以上 |
| 架构 | ARM64（arm64-v8a） |
| 安装包 | 约 31.2 MiB，以发布文件为准 |

将 APK 传到手机后打开安装。首次安装可能需要允许文件管理器或浏览器“安装未知来源应用”。模拟器需要支持 ARM64 应用。

更新时使用同一发布者的安装包**直接覆盖安装，不要先卸载**。卸载应用或清除应用数据可能删除本地装备预设与配置。不同签名的安装包不能直接覆盖。

## 适配与当前限制

- 布局根据实际可用宽度适配，而非只按屏幕分辨率判断；系统 DPI、字体大小和输入法都会影响显示。
- 已做多种手机宽度的浏览器布局验证，但尚未覆盖所有品牌真机。
- 本版本不提供角色图鉴、神器图鉴和图鉴数据编辑界面。
- **截图识别暂未实现**，当前为占位入口；未集成截图 OCR 模型。
- Android 版本通过 APK 覆盖安装更新，不使用 Windows EXE 更新流程。
- 数据保存在本机，不提供跨设备云同步。
- 新角色、技改和特殊机制可能存在遗漏，欢迎提交可复现的计算案例。

## 本地开发

技术栈：React、TypeScript、Vite、Tauri 2、Rust。

### Web 预览

建议使用 Node.js 22.12 或以上兼容版本及 npm。

```powershell
npm ci
npm run dev
```

浏览器打开 `http://127.0.0.1:5174`。Web 预览用于页面和计算逻辑调试，不能替代 Android 返回手势、输入法及私有目录存储验证。

构建与单元测试：

```powershell
npm run build
npm test
```

移动布局回归测试先启动预览服务：

```powershell
npx playwright install chromium
npm run preview -- --host 127.0.0.1 --port 5184 --strictPort
```

另开终端运行：

```powershell
node scripts/test-mobile-layout.mjs
node scripts/test-mobile-tools.mjs
node scripts/test-mobile-back.mjs
```

### Android 构建

仓库的一键打包脚本面向 Windows，需准备：

- PowerShell 7（`pwsh`）。
- Rust，以及 `aarch64-linux-android` 编译目标。
- JDK 17。
- Android SDK 36、Build Tools 36.0.0、Platform Tools。
- Android NDK 27.2.12479018（r27c）。

```powershell
rustup target add aarch64-linux-android
```

在 Windows **用户环境变量**中配置 `JAVA_HOME`、`ANDROID_HOME`、`NDK_HOME`，分别指向 JDK、SDK 和 NDK 目录。脚本会读取用户级配置，仅设置当前终端临时变量不足以替代这一步。

仓库中的 `src-tauri/gen/android` 包含定制的 Android 返回处理代码，请勿随意重新生成并覆盖。

双击根目录的 `打包安卓版.bat`，或执行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-android.ps1
```

已签名 APK 输出到 `release/`，文件名随版本号变化。`npm run android:apk` 仅执行编译，未配置 Gradle 签名时会生成 unsigned APK，不能直接作为正式安装包发布。

### GitHub 自动发布

仓库配置了 Android Release 工作流。更新 `package.json`、`src-tauri/tauri.conf.json` 和 `src-tauri/Cargo.toml` 中的版本号并推送同名标签（例如 `v0.1.8`）后，GitHub Actions 会自动构建、签名并校验 ARM64 APK，同时把 APK 和 SHA256 文件上传到对应 Release。

仓库需要配置 `ANDROID_KEYSTORE_BASE64` 和 `ANDROID_KEYSTORE_PASSWORD` 两个 Actions Secrets。签名密钥只通过 Secrets 提供，不提交到 Git 历史。

### 签名与用户数据

签名文件保存在 `%LOCALAPPDATA%/Epic7CalcSigning`，密码使用 Windows DPAPI 加密，仅对应 Windows 用户可解密。覆盖升级必须保留同一签名密钥；迁移电脑前应安全备份密钥与密码。

**不要将签名密钥、密码文件、个人装备预设或本机环境配置上传到 GitHub。** APK 建议作为 Releases 附件发布，而非放入源码仓库。

Android 装备预设等用户数据保存在应用私有目录，不是源码中的社区预设文件。

## 与主项目同步

移动版构建会自动排除不用的图鉴立绘，规则及恢复方式见[图片资源维护](docs/dev/mobile-assets.md)。

| 项目 | 定位 |
| --- | --- |
| `e7-tools` | 主项目，维护共享数据与计算逻辑 |
| `epic7-calc` | Windows 计算器与角色装备版本 |
| `epic7-calc-mobile` | Android 版本，独立维护移动布局和原生交互 |

共享数据、公式和装备逻辑应先在主项目修改，再通过白名单脚本同步到移动端：

```powershell
pwsh -File .\scripts\sync-mobile-from-e7-tools.ps1
npm run build
npm test
```

默认主项目是同级目录 `e7-tools`。如目录不同，可指定：

```powershell
pwsh -File .\scripts\sync-mobile-from-e7-tools.ps1 -SourceRoot D:\projects\e7-tools
```

脚本保留移动端入口、导航、样式、装备页面、Android 配置和版本信息，不复制 OCR 文件。**不要直接用桌面项目整目录覆盖移动项目。** 同步后还需验证手机布局、计算结果与原生返回行为。

## 反馈问题

提交 Issue 时请尽量附上：

- 应用版本、手机型号和 Android 版本。
- 显示异常时的系统字体大小、显示缩放设置及截图。
- 操作步骤、期望结果和实际结果。
- 伤害异常时的角色、技能、面板、神器等级、套装、专属装备和双方 Buff / Debuff。

截图或配置中涉及个人信息时，请先遮挡或移除。

## 致谢与许可

- 感谢 [epic7-damage-calc](https://github.com/tyopoyt/epic7-damage-calc) 及相关社区数据贡献者。
- 本仓库代码许可见 [LICENSE](LICENSE)。使用和分发时请保留适用的版权与许可声明。
- 游戏名称、角色、神器及美术资源归各自权利人所有，不因本仓库的代码许可而授予相关资源的使用权。
- 本项目与游戏官方无隶属或合作关系。
