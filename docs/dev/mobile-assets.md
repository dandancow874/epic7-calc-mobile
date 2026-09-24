---
doc_type: dev-guide
slug: mobile-assets
component: android-assets
status: current
summary: 移动端同步和构建时排除不用的图鉴立绘，保留计算器与装备页面图标。
tags: [android, assets, build]
last_reviewed: 2026-09-06
---

# 移动版图片资源维护

## 概述

移动版没有角色和神器图鉴页面，不应打包其立绘。原 APK 约 380 MiB，主要体积来自嵌入原生库的图鉴图片，并非 OCR。不要按文件大小或整个 heroes 目录直接删除，否则会误删装备页面头像。

## 快速上手

```powershell
npm run assets:prune
npm run build
npm test
```

`npm run build` 的 prebuild 和 `scripts/sync-mobile-from-e7-tools.ps1` 会自动执行精简脚本。新同步进来的立绘不会再次进入下一次正常构建。修改这些流程时必须保留此步骤。

## 排除与保留规则

脚本读取 public/library 的 heroes、artifacts、presets JSON，仅移动 artwork 字段指向的文件；若同一路径也出现在非 artwork 字段中，优先保留。头像、神器小图标、技能、专属装备、Buff 图标及 JSON 数据不删除。不改动主项目和 Windows 下游。

图片移到项目根目录 artwork-backup.local，保留相对目录；已有备份时新副本加时间后缀。该目录由 .gitignore 的 *.local 忽略，不进入 public、dist 或 APK。它用于恢复，不应上传 GitHub。

目录 JSON 中 artwork 路径仍保留，以便与主项目同步，不代表移动端可以打开立绘。将来启用图鉴页面时，需先恢复所需图片并调整排除规则。

## 验证与发布

2026-09-06 验证：移出 659 张立绘，共 348.24 MiB；重新构建的 dist 为 34.75 MiB。386 个角色头像和 278 个神器小图标引用全部存在；116 项单元测试通过。再次运行精简脚本移动 0 个文件，支持重复执行。这是前端构建目录大小，不是新 APK 的实测大小。

构建后检查 dist 体积，运行测试，并验证角色与神器选择、技能和 Buff 图标。执行打包安卓版.bat 重新生成已签名 APK；仅精简源码不能改变已经生成或发布的 APK。不要用 -SkipBuild 发布资源变更。

旧 APK 保留原样，上传新包前核对构建时间、体积和版本。备份不影响 APK 体积，但仍占本地磁盘；确认无需恢复后再单独清理。

## 相关文档

2026-09-06 已重新构建并签名 v0.1.5 ARM64 APK：32,691,648 字节（约 31.2 MiB），替换 release 中同名旧包。APK v2/v3 签名和 16 KiB 对齐校验通过；SHA256：`2E6A24DA448D629BBEF22A10C58F32C4B3B237BA65047CED6CF72B738FE44EA7`。本次未改变版本号，未进行真机安装测试。

- [项目 README](../../README.md)
