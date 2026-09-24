# Android 构建记录

## 0.1.8 GitHub 应用内更新 — 2026-09-24

- 启动后在后台静默查询一次 `dandancow874/epic7-calc-mobile` 的最新 GitHub Release；当前版本、网络失败或资源不符合命名规则时不打扰用户。
- 发现更高版本后显示取消/确认弹窗。确认后使用 Android `DownloadManager` 下载签名 APK，下载完成后打开系统安装界面。
- Android 8 及以上首次使用需要开启本应用的“允许安装未知应用”；安装确认由 Android 系统负责，无法静默绕过。
- APK 仅写入应用专属 `Download` 目录，不申请共享存储权限；下载地址限制为本仓库的 HTTPS Release 路径，文件名限制为正式 ARM64 APK 格式。
- 首个带更新器的版本仍需手动安装一次。之后只要 GitHub Release 使用相同包名、相同签名并提高版本号，即可由应用提示覆盖安装。
- 验证：33 个测试文件、154 项测试通过；Vite 生产构建通过；Android ARM64 Rust/Kotlin/Gradle 构建通过。签名 APK 为 `release/Epic7-Calc-Mobile-v0.1.8-arm64.apk`，32,925,120 字节，SHA256 `C69CF0287A678C346CD3F6BAEB3A9C6D489343B628CC2B52D0B1451A62B28898`；v2/v3 签名与 16 KiB ZIP 对齐通过，Manifest 已包含 `INTERNET` 和 `REQUEST_INSTALL_PACKAGES`。真机下载安装流程仍待覆盖安装验证。

## 0.1.1 修复包

文件：`release/Epic7-Calc-Mobile-v0.1.1-arm64.apk`。默认双方折叠、支持收起、展开后去重头部、手机搜索弹窗滚动区域修复。沿用原签名，v2/v3 签名与 ZIP 对齐检查通过。SHA256：32FE903AE01285C4629BBA8EB0F8506EC6B19DCDF57DE6FD557F5DD9E1C9D423。116 项移动测试、131 项主仓库测试和六种宽度的浏览器交互检查通过。真机/模拟器输入法验收待用户确认。

## 交付

- 文件：`release/Epic7-Calc-Mobile-v0.1.0-arm64.apk`
- 版本：0.1.0 / versionCode 1000
- 应用 ID：com.epic7.calc.mobile
- 架构：arm64-v8a；minSdk 24；targetSdk 36
- 大小：397956544 字节（约 380 MiB）
- SHA256：3BFB73CB6F7DEFAA1EC158831047D607CF7A9A8E6B6B95686273046B0A071464

## 验证结果

- Web 生产构建与 ARM64 Rust release、Android Gradle release 构建通过。
- 26 个测试文件、116 项测试通过。
- apksigner 验证 v2/v3 签名通过。
- zipalign `-c -P 16 4` 检查通过。
- 原生库全部 LOAD 段 ELF 对齐为 0x4000（16 KB），通过 build.rs 的 Android 专用链接参数实现。
- aapt 核对版本、架构和最低 Android 版本通过。
- 未连接手机：尚未验证真机安装、软键盘、安全区域、返回手势和重启后数据保存。不得将 Web 视口检查等同真机验收。

## 环境及复现

本机安装了 Temurin JDK 17.0.20.1+1、Android SDK 36、Build Tools 36.0.0、NDK 27.2.12479018、Platform Tools 37.0.1 和 Rust Android targets。位置为 `%LOCALAPPDATA%/Android`，用户环境变量 JAVA_HOME、ANDROID_HOME、NDK_HOME 已配置。

双击根目录 `打包安卓版.bat`；也可以执行 `pwsh -File scripts/build-android.ps1`。脚本会构建、签名、验证并输出 APK。`-SkipBuild` 仅签名已有构建产物，不应用源码变化。

本机 Java AF_UNIX 连接报 Invalid argument，普通 IPv4 参数不能解决。脚本局部设置 `-Djdk.net.unixdomain.tmpdir=NUL`，使 OpenJDK 的 PipeImpl 使用 TCP 回退；未修改防火墙或系统网络设置。

签名密钥与 DPAPI 加密密码保存在 `%LOCALAPPDATA%/Epic7CalcSigning`，不在仓库内。后续覆盖安装必须沿用密钥，不要删除该目录。手机卸载应用可能删除预设；更新应使用同包名同签名覆盖安装。

## 主从关系

共享公式和数据先改 `e7-tools`，再通过 `scripts/sync-mobile-from-e7-tools.ps1` 同步。不要用整目录覆盖方式更新移动仓库。移动入口、样式、导航、Android 配置和版本号归移动仓库维护。

当前大体积主要来自打包的本地静态素材，未打包 OCR。尚未进行未使用素材裁剪。
