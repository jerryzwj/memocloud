# Android 私有云备忘录——标准包结构（最终完整版）
项目名称：MemoCloud

# 安卓私有云备忘录 —— 标准项目分包结构（最终完整版）

这是**可直接新建、可长期维护、支持多WebDAV切换、图片/富文本/同步全正常**的官方标准分包，复制到Android Studio直接用，零混乱、零耦合。

---

# 一、技术栈与依赖项

## 1.1 核心技术栈

| 技术/框架 | 版本 | 用途 |
|---------|------|------|
| Kotlin | 1.9.0+ | 主要开发语言 |
| Jetpack Compose | 1.5.0+ | UI构建 |
| Room | 2.5.0+ | 本地数据库 |
| Coroutines | 1.7.0+ | 异步操作 |
| LiveData/Flow | 2.6.0+ | 数据流管理 |
| ViewModel | 2.6.0+ | UI状态管理 |

## 1.2 第三方依赖

| 依赖库 | 版本 | 用途 |
|-------|------|------|
| Sardine-android | 5.1.0+ | WebDAV客户端 |
| Markwon | 4.6.2+ | Markdown渲染 |
| Coil | 2.4.0+ | 图片加载与缓存 |
| Gson | 2.10.0+ | JSON序列化/反序列化 |
| Android KeyStore | 内置 | 安全存储 |

---

# 二、项目初始化

## 2.1 创建项目

1. 在Android Studio中创建新项目
2. 选择「Empty Compose Activity」模板
3. 包名设置为：`com.memocloud.memo`
4. 语言选择Kotlin
5. 最低SDK版本设置为API 21+

## 2.2 配置Gradle

在项目级build.gradle.kts中添加必要的依赖：

```kotlin
// 项目级build.gradle.kts
dependencies {
    // 其他依赖...
    classpath("com.google.devtools.ksp:com.google.devtools.ksp.gradle.plugin:1.9.0-1.0.13")
}
```

在应用级build.gradle.kts中添加依赖：

```kotlin
// 应用级build.gradle.kts
plugins {
    // 其他插件...
    id("com.google.devtools.ksp")
}

dependencies {
    // 核心依赖
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    implementation("androidx.compose.ui:ui:1.5.4")
    implementation("androidx.compose.material3:material3:1.1.2")
    
    // Room
    implementation("androidx.room:room-runtime:2.5.2")
    implementation("androidx.room:room-ktx:2.5.2")
    ksp("androidx.room:room-compiler:2.5.2")
    
    // WebDAV
    implementation("com.github.thegrizzlylabs:sardine-android:0.8")
    
    // Markdown
    implementation("io.noties.markwon:core:4.6.2")
    implementation("io.noties.markwon:editor:4.6.2")
    
    // 图片处理
    implementation("io.coil-kt:coil-compose:2.4.0")
    
    // JSON
    implementation("com.google.code.gson:gson:2.10.1")
    
    // 测试
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.5.4")
    debugImplementation("androidx.compose.ui:ui-test-manifest:1.5.4")
}
```

---

# 三、整体包名规则

```Plain Text

com.memocloud.memo
```

## 3.1 包名规范

- 包名采用反向域名格式
- 所有包名使用小写字母
- 单词之间用点号分隔
- 避免使用保留字和特殊字符

## 3.2 模块命名规范

| 模块类型 | 命名规范 | 示例 |
|---------|---------|------|
| 包名 | 小写字母 + 点号 | `com.memocloud.memo.webdav` |
| 类名 | 大驼峰命名法 | `WebDavClientManager` |
| 方法名 | 小驼峰命名法 | `uploadFile()` |
| 变量名 | 小驼峰命名法 | `currentServerConfig` |
| 常量名 | 全大写 + 下划线 | `MAX_RETRY_COUNT` |

---

# 四、完整分包结构（层级清晰）

```Plain Text

memo/
├── base/                # 基类封装
├── config/              # WebDAV多服务器配置管理
├── model/               # 数据实体（Room + JSON）
├── db/                  # Room数据库全套
├── webdav/              # WebDAV核心操作
├── image/               # 图片选择、压缩、上传
├── markdown/            # 富文本编辑、渲染
├── ui/                  # 所有页面UI（Compose）
│   ├── setup/           # WebDAV配置页
│   ├── folder/          # 文件夹列表
│   ├── note/            # 笔记列表 + 编辑 + 查看
│   └── theme/           # 主题、颜色、形状、字体
├── viewmodel/           # MVVM ViewModel
├── repository/          # 数据仓库（本地+云端）
├── utils/               # 全局工具类
└── App.kt               # Application入口
```

---

# 五、每个包详细说明 & 内部文件清单

## 1）base —— 基类

```Plain Text

BaseViewModel.kt      // 提供公共协程、状态管理
BaseUiState.kt        // 页面通用状态（加载/成功/失败）
```

## 2）config —— 多WebDAV配置（支持切换）

```Plain Text

WebDavConfig.kt              // 配置实体
WebDavConfigManager.kt       // 配置管理：切换、获取当前服务器
DeviceIdManager.kt           // 设备唯一ID生成与管理
```

## 3）model —— 数据实体

```Plain Text

Folder.kt
Note.kt
```

## 4）db —— Room 数据库

```Plain Text

AppDatabase.kt              // 数据库实例
dao/
   FolderDao.kt
   NoteDao.kt
   WebDavConfigDao.kt
converter/
   StringListConverter.kt   // 图片列表 List<String> 转JSON
```

## 5）webdav —— WebDAV操作核心

```Plain Text

WebDavClientManager.kt       // Sardine单例管理
WebDavApi.kt                 // 上传、下载、创建目录、列表文件
SyncManager.kt               // 同步引擎：全量同步、冲突处理
SwitchServerManager.kt       // 切换WebDAV安全流程
```

## 6）image —— 图片模块

```Plain Text

ImagePicker.kt               // 系统相册选择
ImageFileUtils.kt            // Uri转File、压缩
ImagePathHelper.kt           // 图片路径动态拼接
```

## 7）markdown —— 富文本

```Plain Text

MarkdownRenderer.kt          // Markdown渲染组件
EditorToolBar.kt             // 编辑工具栏：粗体、标题、列表
```

## 8）ui —— 全部页面

```Plain Text

theme/
   Theme.kt                  // 颜色、形状、字体
   ThemePreview.kt
setup/
   WebDavSetupPage.kt        # 设置/切换服务器
folder/
   FolderListPage.kt         # 文件夹列表
note/
   NoteListPage.kt           # 笔记列表
   NoteEditPage.kt           # 笔记编辑（富文本+图片）
   NoteViewPage.kt           # 笔记查看页
```

## 9）viewmodel

```Plain Text

WebDavConfigViewModel.kt
FolderViewModel.kt
NoteViewModel.kt
SyncViewModel.kt
```

## 10）repository —— 数据中间层

```Plain Text

AppRepository.kt             // 统一调度本地DB + WebDAV
FolderRepository.kt
NoteRepository.kt
WebDavConfigRepository.kt
```

## 11）utils —— 工具类

```Plain Text

TimeUtils.kt           // 时间戳格式化
UuidUtils.kt           // 生成唯一ID
FileUtils.kt           // 文件操作
EncryptUtils.kt        // 密码加密存储
JsonUtils.kt           // Gson工具
```

---

# 六、核心类职责（一句话说明）

- **SwitchServerManager**：切换服务器 → 清空本地 → 重新拉取

- **SyncManager**：对比时间戳 → 上传/下载 → 处理冲突

- **ImagePathHelper**：永远用**当前WebDAV地址**动态拼图片路径

- **WebDavConfigManager**：保证永远只有一个「当前服务器」

- **DeviceIdManager**：多设备同步必备

---

# 七、这套结构的优势（你最关心）

1. **切换WebDAV绝对不混乱**

数据隔离、切换清空本地、路径动态生成

1. **后期可无限扩展**

加密码锁、标签、搜索、PC端都不用重构

1. **代码解耦**

UI不直接操作WebDAV，全靠ViewModel+Repository

1. **可维护性极强**

别人接手也能立刻看懂

---

如果你需要，我可以继续给你：

## 2）**WebDAV切换工具类完整代码**

直接复制就能实现「一键换服务器」功能，你要我现在生成吗？
> （注：文档部分内容可能由 AI 生成）

---

# 八、测试策略

## 8.1 测试类型

| 测试类型 | 工具/框架 | 测试内容 |
|---------|----------|----------|
| 单元测试 | JUnit + Mockito | 核心业务逻辑 |
| 集成测试 | AndroidJUnitRunner | 组件间交互 |
| UI测试 | Espresso + ComposeTest | 用户界面交互 |
| 性能测试 | Android Profiler | 内存、CPU使用 |

## 8.2 测试重点

- WebDAV连接与操作测试
- 同步机制测试（包括冲突处理）
- 图片上传/下载测试
- Markdown编辑与渲染测试
- 多服务器切换测试
- 离线操作测试

## 8.3 测试覆盖率目标

- 核心业务逻辑：80%+ 覆盖率
- 数据处理模块：75%+ 覆盖率
- UI组件：60%+ 覆盖率

---

# 九、安全与性能优化

## 9.1 安全措施

### 9.1.1 数据安全

- 使用Android KeyStore存储WebDAV认证信息
- 敏感数据传输使用HTTPS
- 本地数据库加密（可选）
- 权限管理严格遵循最小权限原则

### 9.1.2 代码安全

- 防止SQL注入（使用Room参数化查询）
- 防止XSS攻击（Markdown渲染安全处理）
- 防止文件路径遍历攻击
- 定期更新依赖库，修复安全漏洞

## 9.2 性能优化

### 9.2.1 网络优化

- 实现WebDAV连接池管理
- 批量操作减少网络请求
- 增量同步减少数据传输
- 网络状态监测，智能切换同步策略

### 9.2.2 存储优化

- 图片压缩与缓存策略
- 本地数据库索引优化
- 定期清理无用数据
- 大文件分块上传/下载

### 9.2.3 UI优化

- Compose组件懒加载
- 图片加载优化（使用Coil）
- 后台操作与UI线程分离
- 避免UI卡顿的动画效果

---

# 十、部署与发布

## 10.1 应用签名

1. 创建签名密钥库（keystore）
2. 在build.gradle中配置签名信息
3. 确保签名信息安全存储，不提交到版本控制系统

## 10.2 构建变体

| 变体 | 用途 | 配置 |
|-----|------|------|
| debug | 开发测试 | 开启日志，禁用混淆 |
| release | 正式发布 | 关闭日志，开启混淆 |

## 10.3 发布流程

1. 执行全面测试（功能、性能、安全）
2. 生成发布版本APK/AAB
3. 上传到Google Play Console或其他应用商店
4. 填写应用信息、截图、描述等
5. 提交审核并发布

## 10.4 版本管理

- 遵循语义化版本规范（如1.0.0）
- 维护版本更新日志
- 向后兼容性考虑

---

# 十一、开发建议与最佳实践

## 11.1 代码规范

- 遵循Kotlin编码规范
- 使用Android Studio代码检查工具
- 定期进行代码审查
- 保持代码风格一致性

## 11.2 开发流程

- 使用Git进行版本控制
- 遵循分支管理策略（如Git Flow）
- 实现CI/CD流程（可选）
- 自动化测试集成

## 11.3 维护与升级

- 建立bug跟踪系统
- 定期备份WebDAV数据
- 提供应用内检查更新功能
- 维护技术文档，及时更新

## 11.4 用户体验

- 提供清晰的错误提示
- 实现优雅的加载状态
- 支持深色模式
- 响应式设计，适配不同屏幕尺寸

---

# 十二、常见问题与解决方案

## 12.1 WebDAV连接问题

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| 连接超时 | 网络不稳定或服务器响应慢 | 增加超时时间，实现重试机制 |
| 认证失败 | 用户名/密码错误 | 提供清晰的错误提示，引导用户检查配置 |
| 权限不足 | WebDAV服务器权限设置 | 确保用户有正确的读写权限 |

## 12.2 同步问题

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| 同步冲突 | 多设备同时编辑 | 实现冲突检测与解决机制 |
| 同步失败 | 网络中断或服务器错误 | 实现断点续传，本地缓存待同步数据 |

## 12.3 性能问题

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| 应用卡顿 | UI线程执行耗时操作 | 移至后台线程，使用协程 |
| 内存占用高 | 图片缓存过大 | 实现图片缓存大小限制，定期清理 |

---

# 十三、总结

本开发文档提供了一个完整的Android WebDAV备忘录应用的标准分包结构和实现指南。通过遵循文档中的架构设计和最佳实践，你可以开发出一个功能完善、安全可靠、性能优良的私有云备忘录应用。

关键优势：
- 清晰的分层架构，代码解耦
- 支持多WebDAV服务器切换
- 完整的图片和Markdown支持
- 高效的同步机制
- 良好的扩展性和可维护性

希望这份文档对你的开发工作有所帮助！