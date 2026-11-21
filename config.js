/* ============================================================================
 * XY护盾 官网 —— 全局配置中心 (config.js)
 * ----------------------------------------------------------------------------
 * 【这个文件干什么用的】
 *   全站所有"需要经常改、但不想动 HTML/CSS"的东西，全部集中在这里。
 *   以后你要换下载链接、改版本号、改作者名、改抖音号，
 *   只改这一个文件就行，其他任何文件都不用碰。
 *
 * 【怎么改】
 *   用任意文本编辑器打开本文件 → 修改下面 XY_CONFIG 对象里的值 → 保存 → 刷新网页。
 *   注意：字符串必须用英文单引号 ' 或双引号 " 包起来，末尾逗号不要漏。
 *
 * 【关于下载链接】
 *   已经填入你的 qyshare 网盘直链，页面处于"正常模式"：
 *     - 下载按钮可点击，直接跳转到下载页；
 *     - 不再显示"待公布"角标。
 *   以后要换链接，把新链接原样粘到 downloadUrl 的引号中间即可；
 *   若清空成 ''，页面会自动退回"占位模式"（弹提示 + 显示待公布角标）。
 * ========================================================================== */

const XY_CONFIG = {

  /* -------------------------------------------------------------------------
   * 1. 应用基础信息
   * ---------------------------------------------------------------------- */

  // 应用名称（会出现在页面标题、导航栏、页脚版权里）
  appName: 'XY护盾',

  // 应用副标题 / Slogan（Hero 区域大标题下面那一行小字）
  appSlogan: '实时守护 · 被恶意应用困住时，摇一摇即可弹出紧急拦截',

  // 当前版本号（会显示在 Hero 的版本胶囊和"版本信息"卡片里）
  // 对应你截图里的 v8.1 (81)
  versionName: 'v8.1',

  // 版本构建号（versionCode），和上面的版本名一起显示
  versionCode: '81',

  // APK 安装包体积（仅用于页面上展示，随便你写，比如 '3.2 MB'）
  // 不想显示就写成空字符串 ''
  apkSize: '2.8 MB',

  // 支持的最低 Android 版本
  minAndroid: 'Android 7.0+',


  /* -------------------------------------------------------------------------
   * 2. ⭐ 下载链接（最重要的变量，你以后主要改这一个）
   * ---------------------------------------------------------------------- */

  // 【Android 版下载地址】—— 已填入你的下载链接
  // 示例：
  //   downloadUrl: 'https://www.lanzoue.com/xxxxxx',
  //   downloadUrl: 'https://github.com/user/repo/releases/download/v8.1/xy-shield.apk',
  downloadUrl: 'https://d6.qyshare.click/s/TBVWTxUNFQQFVKFCVA504ODlNSGgNTKFCVA50QQaKFCVA50wQFBxoPUgdVGgKFCVA50EBgcODg4PVlYEVRUbFVhERH9YREMVDRVYREQZRk5CWRlYRVKFCVA50VGxVYRER8Uk4VDRVCR1tYVlMYBQcFKFCVA50RgGBhgHKFCVA50xgEKFCVA50gEED1NTKFCVA50BpTDwBUGgMCDgUaD1QKFCVA50VBoCD1FSUlICBFQKFCVA50VQcZVV5ZFRsVVlQVDRUDVKFCVA50ZVU1ZSBxoCUwcCGgMCVVMaVVUFKFCVA50xpUVVRVBlJVVlUKFCVA50DgEVGxVZVlpSFQ0Vb27RvZPQrIkZVkdcFRsVVFhZQ1JZQ2NOR1IVDRVWR0dbXlRWQ15YWRhBWVMZVllTRVheUxlHVlRcVlBSGlZFVF9eQVIVGxVWUxUNFQcCKFCVA50KFCVA50dRVgUHGgNSDwYaKFCVA50wNVBxpWKFCVA501UDGg5SBKFCVA50VSVKFCVA50cKFCVA50KFCVA50gBRUhVK',

  // 备用下载地址（比如备用网盘），页面会显示成"备用下载"小链接
  // 不需要就保持空字符串
  downloadUrlBackup: '',

  // 【Windows 版下载地址】—— 点击下载按钮后，弹窗里第二项就是它
  windowsDownloadUrl: 'https://d6.qyshare.click/s/TBVWTxUNFQUCBQQDUwZVGlVUBFYaKFCVA50wVTUxoOVlRRGlRRKFCVA50g9SKFCVA50gZRKFCVA50wKFCVA50PKFCVA50hUbFVhERH9YREMVDRVYREQZRk5CWRlYRVKFCVA50VGxVYRER8Uk4VDRVCR1tYVlMYBQcFKFCVA50RgGBhgGKFCVA50xgDBKFCVA50EOKFCVA50wKFCVA50PBBpTVQKFCVA50KFCVA50GgMCVVEaDwQFKFCVA50RpVUVRSBwcGBwQDD1EZVV5ZFRsVVlQVDRVWKFCVA50lIPBQdVKFCVA50BoGUlEBGgNWVgEaD1YBURoCVFNVBKFCVA50JRVKFCVA504DBlIVGxVZVlpSFQ0Vb27RvZPQrIkaYF5ZU1hKFCVA50RBlST1IVGxVUWFlDUllDY05HUhUNFVZHR1teVFZDXlhZGE8aWkRTWEQaR0VYUEVWWhUbFVZTFQ0VUgQDUgKFCVA50OVVIaBKFCVA50EHBBoDUgMHGlYOKFCVA501YaUwFUBFUFVQJRVFRSFUo=',

  // 下载弹窗文案
  downloadModalTitle: '选择下载版本',
  downloadModalDesc: 'XY护盾 提供 Android 与 Windows 两个版本，按你的设备选择',

  // 下载链接还没准备好时，点击按钮弹出的提示文案
  downloadPlaceholderTip: '下载链接正在准备中，稍后公布，请留意作者抖音号的最新动态～',

  // 下载按钮上的文字
  downloadBtnText: '立即下载',

  // 下载按钮下方的小字说明（比如"仅 Android · 请开启未知来源安装"）
  downloadBtnNote: 'Android / Windows 双版本 · 点按钮选择平台',


  /* -------------------------------------------------------------------------
   * 3. 作者 / 制作人信息
   * ---------------------------------------------------------------------- */

  // 官网主制作人
  authorName: '秋夜y',

  // 主制作人的头衔标签
  authorTitle: '制作人',

  // 官网副制作人，按你的要求写成 墨
  subAuthorName: '墨',

  // 副制作人的头衔标签
  subAuthorTitle: '副制作人',

  // 副制作人的平台说明，会以小字显示在名字下方（名字本身已是"墨"，就不再重复显示平台名）
  subAuthorPlatform: '',

  // 副制作人的抖音主页链接（可选）
  // 格式示例：'https://www.douyin.com/user/xxxxx'
  // 留空则页面不显示"前往主页"按钮
  subAuthorLink: '',

  // 版权年份（页脚用）
  copyrightYear: '2026',


  /* -------------------------------------------------------------------------
   * 4. 首页数字统计（Hero 下方的三个大数字）
   * ---------------------------------------------------------------------- */

  stats: [
    // value 写数字，suffix 是后缀单位，label 是下面的说明文字
    { value: 20,   suffix: '+',  label: '累计拦截记录' },
    { value: 4,    suffix: '项', label: '核心守护能力' },
    { value: 100,  suffix: '%',  label: '本地运行不上传' }
  ],


  /* -------------------------------------------------------------------------
   * 5. 功能特性卡片（"核心能力"区块，想加就照格式往里塞）
   *    icon 用的是内联 SVG 的名字，可选值见 main.js 里的 ICON_MAP
   *    accent 是卡片主题色，可选 green / blue / orange / purple
   * ---------------------------------------------------------------------- */

  features: [
    {
      icon: 'shield',
      accent: 'green',
      title: '实时守护',
      desc: '常驻后台监听应用切换，一旦识别到恶意应用抢占前台，立刻弹出拦截浮层，把控制权还给你。'
    },
    {
      icon: 'shake',
      accent: 'blue',
      title: '摇一摇紧急拦截',
      desc: '被不良应用困在广告页、关不掉也退不出时，直接摇手机，XY护盾会强制把界面抢回来。'
    },
    {
      icon: 'accessibility',
      accent: 'purple',
      title: '无障碍识别',
      desc: '借助无障碍服务读取当前窗口信息，精准判断"是哪个应用在前台"，识别准确率远高于普通轮询。'
    },
    {
      icon: 'window',
      accent: 'blue',
      title: '悬浮窗拦截层',
      desc: '以悬浮窗形式覆盖在恶意界面之上，避免出现"退出了又被弹回来"的死循环。'
    },
    {
      icon: 'terminal',
      accent: 'orange',
      title: 'Shizuku 强力卸载',
      desc: '接入 Shizuku 授权后可直接调用系统级卸载，无需 Root，把流氓应用连根拔掉。'
    },
    {
      icon: 'chart',
      accent: 'green',
      title: '使用情况访问',
      desc: '读取 UsageStats 记录，辅助判断应用启动频次和时长，让拦截决策更聪明。'
    },
    {
      icon: 'list',
      accent: 'blue',
      title: '白名单管理',
      desc: '把常用应用加入白名单，它们永远不会被误拦。误杀一次，加一个，越用越顺手。'
    },
    {
      icon: 'snow',
      accent: 'purple',
      title: '冻结名单',
      desc: '把顽固应用直接冻结——图标不显示、无法启动，从源头上断绝它再次作恶的可能。'
    },
    {
      icon: 'chat',
      accent: 'green',
      title: '在线聊天室',
      desc: '内置轻量聊天室，遇到问题可以直接在 App 里反馈，也能看看其他用户踩过的坑。'
    }
  ],


  /* -------------------------------------------------------------------------
   * 6. 权限说明（"需要哪些权限"区块）
   *    status: 'required' 必须 / 'optional' 可选 / 'recommend' 建议
   * ---------------------------------------------------------------------- */

  permissions: [
    {
      name: '无障碍权限',
      status: 'required',
      desc: '用于识别当前运行的应用，是判断"是否恶意应用在前台"的核心依据。'
    },
    {
      name: '悬浮窗权限',
      status: 'required',
      desc: '用于显示拦截浮层。没有它，拦截功能只能记录、不能真正弹出。'
    },
    {
      name: '使用情况访问',
      status: 'recommend',
      desc: '授权后识别更准，可以区分"用户主动打开"和"应用自启动抢占"。'
    },
    {
      name: 'Shizuku 服务',
      status: 'optional',
      desc: '可选。启动后可使用强力卸载功能，免 Root 直接卸载顽固应用。'
    },
    {
      name: '通知权限',
      status: 'recommend',
      desc: '用于在后台守护时显示常驻通知，防止被系统清理掉进程。'
    }
  ],


  /* -------------------------------------------------------------------------
   * 7. 更新日志（"更新记录"区块，最新的放最前面）
   * ---------------------------------------------------------------------- */

  changelog: [
    {
      version: 'v8.1',
      date: '2026-11-03',
      tag: '最新',
      items: [
        '重构拦截记录页面，新增"冻结名单"独立入口',
        '修复部分机型摇一摇识别不灵敏的问题',
        '新增内置聊天室，支持图片与 @ 提醒',
        '优化白名单匹配逻辑，支持包名前缀匹配'
      ]
    },
    {
      version: 'v8.0',
      date: '2026-10-18',
      tag: '',
      items: [
        '全新 UI，采用柔光渐变风格',
        '接入 Shizuku，实现免 Root 强力卸载',
        '拦截浮层支持自定义文案与倒计时',
        '后台守护稳定性大幅提升'
      ]
    },
    {
      version: 'v7.5',
      date: '2026-09-02',
      tag: '',
      items: [
        '新增使用情况访问授权引导',
        '修复 Android 14 上悬浮窗被系统回收的问题',
        '记录页支持按应用筛选'
      ]
    }
  ],


  /* -------------------------------------------------------------------------
   * 8. 常见问题（FAQ 折叠面板）
   * ---------------------------------------------------------------------- */

  faq: [
    {
      q: 'XY护盾需要 Root 吗？',
      a: '不需要。核心的实时守护、摇一摇拦截、悬浮窗提示都不依赖 Root。只有"Shizuku 强力卸载"需要你手动启动 Shizuku 服务，而 Shizuku 本身也可以通过无线调试启动，不需要 Root。'
    },
    {
      q: '为什么必须给无障碍权限？',
      a: 'Android 从 5.0 开始就限制了普通应用读取"当前前台是哪个应用"的能力。无障碍服务是目前唯一稳定、合规、不需要 Root 的替代方案。XY护盾只读取窗口的包名信息，不会读取你的输入内容。'
    },
    {
      q: '会不会误拦正常应用？',
      a: '不会。默认只拦截被标记为高风险的应用行为，并且所有被拦过的应用都会出现在"拦截记录"里。如果某个应用被误拦，把它加进白名单即可，之后永不再拦。'
    },
    {
      q: '数据会上传到服务器吗？',
      a: '不会。所有拦截判断、白名单、冻结名单、使用记录全部保存在你的手机本地，应用不包含任何上报逻辑。聊天室除外——你在聊天室里主动发送的消息才会走网络。'
    },
    {
      q: '下载链接什么时候公布？',
      a: 'APK 目前还在做最后的签名与机型适配测试，完成后会在作者抖音号第一时间公布。你可以先收藏本页面，链接更新后这里会直接变成可点击状态。'
    }
  ]
};
