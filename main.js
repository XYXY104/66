/* ============================================================================
 *  XY护盾 · 官网脚本 main.js
 *  ---------------------------------------------------------------------------
 *  这个文件只干一件事：把 assets/js/config.js 里的数据，塞进 index.html 里
 *  预先留好的空容器中，并给页面加上交互（下载按钮、滚动毛玻璃、Toast、入场动画）。
 *
 *  ── 为什么要分成 config.js + main.js 两个文件 ────────────────────────────────
 *  因为「数据」和「逻辑」分开，以后你自己维护最省事：
 *    · 改文案 / 改版本号 / 改功能卡 / 改 FAQ  →  只动 config.js，不要动本文件
 *    · 改动画时长 / 改数字滚动速度 / 改 Toast 停留时间  →  只动本文件下面的常量区
 *    · 改颜色 / 圆角 / 字体  →  只动 style.css 顶部的 :root 变量区
 *  三个文件永不需要互相翻，这是本套代码的核心设计原则。
 *
 *  ── 执行时机 ────────────────────────────────────────────────────────────────
 *  index.html 底部是这样引的（顺序不能换）：
 *      <script src="assets/js/config.js" defer></script>
 *      <script src="assets/js/main.js" defer></script>
 *  defer 保证两个脚本都在 HTML 解析完成之后、按书写顺序执行。
 *  也就是说 main.js 跑起来的时候：XY_CONFIG 已经存在，DOM 也已经完整。
 *  但为了极端情况下（有人手动把 defer 删了）也不炸，本文件仍然包了一层
 *  ready() 判断：DOM 没好的话就等 DOMContentLoaded。
 *
 *  ── 如何修改（速查表）──────────────────────────────────────────────────────
 *  1. 想加一张功能卡        → config.js 的 features 数组里照格式加一项，
 *                              icon 必须是下面 ICON_MAP 里已存在的名字，
 *                              否则会退化成默认盾牌图标（不会报错，页面不崩）。
 *  2. 想加一条 FAQ         → config.js 的 faq 数组里加 { q:'问题', a:'答案' }。
 *  3. 想改下载链接         → config.js 的 downloadUrl 填上直链，
 *                              页面三处按钮会自动全部生效，无需改本文件。
 *  4. 想改下载按钮的空态提示 → config.js 的 downloadPlaceholderTip。
 *  5. 想改数字滚动速度     → 下面 CONFIG 区里的 STAT_DURATION 毫秒数。
 *  6. 想改 Toast 停留时长   → 下面 CONFIG 区里的 TOAST_DURATION。
 *
 *  ── 代码分区索引（按顺序往下读即可）────────────────────────────────────────
 *   [0]  运行参数常量
 *   [1]  图标库 ICON_MAP（9 个内联 SVG）
 *   [2]  通用小工具（选择器、转义、安全取值）
 *   [3]  渲染：品牌 / 导航
 *   [4]  渲染：Hero 首屏文案
 *   [5]  渲染：数字统计（含滚动动画）
 *   [6]  渲染：功能卡片
 *   [7]  渲染：权限说明
 *   [8]  渲染：更新日志时间轴
 *   [9]  渲染：作者 / 制作人
 *   [10] 渲染：FAQ 折叠面板
 *   [11] 下载按钮统一逻辑（三处共用）
 *   [12] Toast 提示条
 *   [13] 导航栏滚动毛玻璃
 *   [14] 入场动画（IntersectionObserver）
 *   [15] 启动入口 init()
 * ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
   * [0] 运行参数常量
   *     这里放「跟数据无关、只跟手感有关」的参数。
   *     以后想调节动画节奏，只改这一段，不用去下面翻逻辑代码。
   * ======================================================================== */

  /** 数字从 0 滚到目标值需要多少毫秒。900 是实测下来「看得见在动、又不拖沓」的值 */
  var STAT_DURATION = 900;

  /** Toast 弹出后停留多少毫秒再滑走。2600 大约够读完一行中文提示 */
  var TOAST_DURATION = 2600;

  /** 页面滚动多少像素后给导航栏加 .scrolled（毛玻璃 + 阴影）。
   *  取 12 而不是 0，是为了避免手指轻微抖动就触发、导致导航栏视觉闪烁。 */
  var NAV_SCROLL_THRESHOLD = 12;

  /** 入场动画的级联延迟上限。
   *  style.css 里写了 transition-delay: calc(var(--i) * 80ms)，
   *  如果卡片有 9 张而 --i 一直涨到 8，最后一张要等 640ms 才出现，会显得慢。
   *  所以这里封顶到 8，超过的卡片统一按 8 算。（9 张卡刚好 0~8，不用截断，
   *  以后你加到 20 张卡也不会出现「等两秒才出现」的情况。）*/
  var REVEAL_INDEX_MAX = 8;

  /** 权限状态的英文 → 中文徽章文字 + CSS 主题类。
   *  CSS 里已经定义了 .status-required / .status-recommend / .status-optional
   *  三个类，分别注入 --status-color / --status-soft 两个变量，
   *  左侧 4px 色条、圆点、徽章底色全部跟着这个变量走。
   *  所以这里只要保证「类名拼对」，配色就自动正确。 */
  var STATUS_MAP = {
    required:  { cls: 'status-required',  text: '必须' },
    recommend: { cls: 'status-recommend', text: '建议' },
    optional:  { cls: 'status-optional',  text: '可选' }
  };

  /** 数据兜底对象。
   *  万一 config.js 因为手抖写错了（少个逗号、删错一行）导致 XY_CONFIG 没定义，
   *  页面会变成一片空白 —— 那是很吓人的体验。
   *  所以这里给一套最小可用的兜底值，保证「最坏情况下页面也还是能看的」。 */
  var FALLBACK = {
    appName: 'XY护盾',
    appSlogan: '实时守护 · 被恶意应用困住时，摇一摇即可弹出紧急拦截',
    versionName: 'v8.1',
    apkSize: '2.8 MB',
    downloadUrl: 'https://d6.qyshare.click/s/TBVWTxUNFQQFVKFCVA504ODlNSGgNTKFCVA50QQaKFCVA50wQFBxoPUgdVGgKFCVA50EBgcODg4PVlYEVRUbFVhERH9YREMVDRVYREQZRk5CWRlYRVKFCVA50VGxVYRER8Uk4VDRVCR1tYVlMYBQcFKFCVA50RgGBhgHKFCVA50xgEKFCVA50gEED1NTKFCVA50BpTDwBUGgMCDgUaD1QKFCVA50VBoCD1FSUlICBFQKFCVA50VQcZVV5ZFRsVVlQVDRUDVKFCVA50ZVU1ZSBxoCUwcCGgMCVVMaVVUFKFCVA50xpUVVRVBlJVVlUKFCVA50DgEVGxVZVlpSFQ0Vb27RvZPQrIkZVkdcFRsVVFhZQ1JZQ2NOR1IVDRVWR0dbXlRWQ15YWRhBWVMZVllTRVheUxlHVlRcVlBSGlZFVF9eQVIVGxVWUxUNFQcCKFCVA50KFCVA50dRVgUHGgNSDwYaKFCVA50wNVBxpWKFCVA501UDGg5SBKFCVA50VSVKFCVA50cKFCVA50KFCVA50gBRUhVK',
    downloadUrlBackup: '',
    windowsDownloadUrl: 'https://d6.qyshare.click/s/TBVWTxUNFQUCBQQDUwZVGlVUBFYaKFCVA50wVTUxoOVlRRGlRRKFCVA50g9SKFCVA50gZRKFCVA50wKFCVA50PKFCVA50hUbFVhERH9YREMVDRVYREQZRk5CWRlYRVKFCVA50VGxVYRER8Uk4VDRVCR1tYVlMYBQcFKFCVA50RgGBhgGKFCVA50xgDBKFCVA50EOKFCVA50wKFCVA50PBBpTVQKFCVA50KFCVA50GgMCVVEaDwQFKFCVA50RpVUVRSBwcGBwQDD1EZVV5ZFRsVVlQVDRVWKFCVA50lIPBQdVKFCVA50BoGUlEBGgNWVgEaD1YBURoCVFNVBKFCVA50JRVKFCVA504DBlIVGxVZVlpSFQ0Vb27RvZPQrIkaYF5ZU1hKFCVA50RBlST1IVGxVUWFlDUllDY05HUhUNFVZHR1teVFZDXlhZGE8aWkRTWEQaR0VYUEVWWhUbFVZTFQ0VUgQDUgKFCVA50OVVIaBKFCVA50EHBBoDUgMHGlYOKFCVA501YaUwFUBFUFVQJRVFRSFUo=',
    downloadModalTitle: '选择下载版本',
    downloadModalDesc: '按你的设备选择对应版本',
    downloadPlaceholderTip: '下载链接正在准备中，稍后公布～',
    downloadBtnText: '立即下载',
    downloadBtnNote: '仅支持 Android',
    authorName: '秋夜y',
    authorTitle: '制作人',
    subAuthorName: '墨',
    subAuthorTitle: '副制作人',
    subAuthorPlatform: '',
    subAuthorLink: '',
    copyrightYear: '2026',
    stats: [],
    features: [],
    permissions: [],
    changelog: [],
    faq: []
  };

  /** 最终使用的配置对象：config.js 里有什么就用什么，缺什么就用 FALLBACK 补。
   *  用 for-in 浅合并而不是 Object.assign，是为了兼容极老的 WebView
   *  （部分国产 ROM 内置浏览器内核很旧）。 */
  var CFG = (function buildConfig() {
    // 取数据源。config.js 顶层写的是 const XY_CONFIG = {...}
    // 这里有个很容易踩的坑：脚本作用域里用 const / let 声明的变量
    // 不会挂到 window 上，所以 window.XY_CONFIG 会是 undefined，
    // 页面就会只剩兜底的空数组（功能卡、权限、时间轴全空白）。
    // 正确做法是先探测「全局变量本身」存不存在：
    //   typeof 一个从没声明过的变量也不会抛错，是最安全的探测方式。
    var raw = {};
    if (typeof XY_CONFIG !== 'undefined' && XY_CONFIG) {
      raw = XY_CONFIG;
    } else if (typeof window !== 'undefined' && window.XY_CONFIG) {
      // 兼容另一种写法：有人可能把 config.js 改成 window.XY_CONFIG = {...}
      raw = window.XY_CONFIG;
    }
    var merged = {};
    var k;
    for (k in FALLBACK) {
      if (Object.prototype.hasOwnProperty.call(FALLBACK, k)) {
        merged[k] = Object.prototype.hasOwnProperty.call(raw, k) ? raw[k] : FALLBACK[k];
      }
    }
    // 把 raw 里多出来的字段（FALLBACK 没列到的）也带上，不做丢弃
    for (k in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, k)) merged[k] = raw[k];
    }
    return merged;
  })();


  /* ==========================================================================
   * [1] 图标库 ICON_MAP
   *     config.js 里每个功能卡只写一个 icon 名字（shield / shake / ...），
   *     真正的 SVG 代码放在这里。这样 config 保持「纯数据」，不掺 HTML。
   *
   *     统一规范（很重要，改图标时请遵守）：
   *       · viewBox 一律 0 0 24 24，这样所有图标视觉大小一致
   *       · 只写 path，不要写 fill（fill 由 style.css 的 .feature-icon svg
   *         统一设成 none，描边色用 currentColor 继承卡片的主题色）
   *       · stroke-width 在 CSS 里统一设 1.9，这里不要再写一遍
   *       · 坐标尽量落在 3~21 之间，留出 3px 内边距，避免贴边被裁
   *
   *     想加新图标：在这里加一个键，然后 config.js 里 icon 填同名即可。
   * ======================================================================== */
  var ICON_MAP = {

    /* 盾牌 —— 应用主图标，代表「守护」 */
    shield:
      '<path d="M12 3 19.5 6v6.2c0 4.4-3 7.4-7.5 8.8-4.5-1.4-7.5-4.4-7.5-8.8V6L12 3Z"/>' +
      '<path d="M8.8 12.1l2.2 2.2 4.2-4.4"/>',

    /* 手机左右晃动 —— 代表「摇一摇」 */
    shake:
      '<rect x="8" y="4" width="8" height="16" rx="2.2"/>' +
      '<path d="M4.4 9.2 3 12l1.4 2.8"/>' +
      '<path d="M19.6 9.2 21 12l-1.4 2.8"/>',

    /* 人形 + 四肢 —— 无障碍服务的通用符号 */
    accessibility:
      '<circle cx="12" cy="4.6" r="1.9"/>' +
      '<path d="M4.8 9h14.4"/>' +
      '<path d="M12 9v5.4"/>' +
      '<path d="M12 14.4 9 21"/>' +
      '<path d="M12 14.4 15 21"/>',

    /* 叠加的两层窗 —— 代表「悬浮窗覆盖在恶意界面之上」 */
    window:
      '<rect x="3" y="3.6" width="12.4" height="9.6" rx="1.8"/>' +
      '<path d="M3 6.6h12.4"/>' +
      '<rect x="8.6" y="10.8" width="12.4" height="9.6" rx="1.8"/>',

    /* 终端提示符 —— 代表「Shizuku 命令级操作」 */
    terminal:
      '<rect x="3" y="4.4" width="18" height="15.2" rx="2.4"/>' +
      '<path d="M7 10l2.6 2.4L7 14.8"/>' +
      '<path d="M12.4 15h4.6"/>',

    /* 柱状图 —— 代表「使用情况统计」 */
    chart:
      '<path d="M4 20V4"/>' +
      '<path d="M4 20h16"/>' +
      '<rect x="7.6" y="12.4" width="3" height="5"/>' +
      '<rect x="13" y="8.6" width="3" height="8.8"/>' +
      '<rect x="18.4" y="10.4" width="2.4" height="7"/>',

    /* 三条带勾的清单 —— 代表「白名单」 */
    list:
      '<path d="M4 7h3"/>' +
      '<path d="M4 12h3"/>' +
      '<path d="M4 17h3"/>' +
      '<path d="M10 7h10"/>' +
      '<path d="M10 12h10"/>' +
      '<path d="M10 17h10"/>',

    /* 雪花 —— 代表「冻结」 */
    snow:
      '<path d="M12 3v18"/>' +
      '<path d="M4.2 7.5 19.8 16.5"/>' +
      '<path d="M19.8 7.5 4.2 16.5"/>' +
      '<path d="M9.4 5.4 12 7.6l2.6-2.2"/>' +
      '<path d="M9.4 18.6 12 16.4l2.6 2.2"/>',

    /* 对话气泡 —— 代表「内置聊天室」 */
    chat:
      '<path d="M20.5 12c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4.5 20.5l1.4-3.6C4.6 15.6 3.5 13.9 3.5 12c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>' +
      '<path d="M8.6 11.4h6.8"/>' +
      '<path d="M8.6 14.2h4.2"/>'
  };

  /** 取图标：名字不存在时退化成盾牌，绝不返回 undefined 导致页面崩 */
  function getIcon(name) {
    return ICON_MAP[name] || ICON_MAP.shield;
  }


  /* ==========================================================================
   * [2] 通用小工具
   * ======================================================================== */

  /** 单个元素查询的简写。$('#id') / $('.cls') */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  /** 批量查询，返回真数组（NodeList 没有 forEach 的老内核也能跑） */
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /**
   * HTML 转义。
   * config.js 里的文字是我们自己写的，按理说不会有 < > 这种字符，
   * 但有两个真实场景需要它：
   *   ① 文案里出现「<」比如「耗时 < 1 秒」
   *   ② 以后你从别的地方（剪贴板、表格）复制文案进来，可能带 & 或引号
   * 不转义的话 innerHTML 会把它们当标签解析，直接导致排版错乱。
   * 成本几乎为零，所以所有插进 innerHTML 的文本都过一遍这个函数。
   */
  function esc(str) {
    var s = String(str == null ? '' : str);
    // 不用正则、不用 replace(/"/g)，是为了兼容极旧的 WebView 与各种「转义层」；
    // 并且 \x26 / \x22 这两个转义写得清楚，改的时候不会误把 & 当成 HTML 实体去改。
    return s.split('\x26').join('\x26amp;')     // \x26 = &
            .split('<').join('\x26lt;')
            .split('>').join('\x26gt;')
            .split('\x22').join('\x26quot;')    // \x22 = 双引号
            .split(String.fromCharCode(39)).join('\x26#39;'); // 单引号
  }

  /** 安全设置文本（用 textContent，天然免疫 XSS，也不需要转义） */
  function setText(selector, text) {
    var node = $(selector);
    if (node) node.textContent = text == null ? '' : String(text);
  }

  /** 给一组元素批量挂 reveal 类 + --i 级联序号。
   *  这一步必须放在「已经插入 DOM 之后」，否则 observer 抓不到新节点。 */
  function applyReveal(nodes) {
    nodes.forEach(function (node, i) {
      if (!node) return;
      node.classList.add('reveal');
      // 超过上限就用上限值，避免卡片太多时最后几张等太久
      node.style.setProperty('--i', String(Math.min(i, REVEAL_INDEX_MAX)));
    });
  }


  /* ==========================================================================
   * [3] 渲染：品牌 / 导航
   *     把 header 里写死的「XY护盾」换成 config 里的 appName，
   *     这样以后改名只要动 config.js 一个字段。
   * ======================================================================== */

  function renderBrand() {
    // 导航栏左侧品牌名
    setText('#navBrandName', CFG.appName);

    // 顺便把浏览器标签栏标题也带上是哪个站（保留原本的后缀描述）
    // 只在原 title 里已经包含旧名字时才替换，避免覆盖你手写的自定义标题
    if (document.title && document.title.indexOf('XY护盾') === 0) {
      // 形如「XY护盾 - 实时守护…」→ 只替换「XY护盾」这一段
      document.title = CFG.appName + document.title.slice(4);
    }
  }


  /* ==========================================================================
   * [4] 渲染：Hero 首屏文案
   * ======================================================================== */

  function renderHero() {
    // ── 版本胶囊 ──────────────────────────────────────────────────────────
    // 显示「v8.1 · 已发布 · 2.8 MB」，让用户一眼知道版本和体积
    var pillParts = [];
    if (CFG.versionName) pillParts.push(CFG.versionName);
    pillParts.push('已发布');
    if (CFG.apkSize) pillParts.push(CFG.apkSize);
    setText('#heroPillText', pillParts.join(' · '));

    // ── 主标题 ────────────────────────────────────────────────────────────
    setText('#heroTitle', CFG.appName);

    // ── 副标题（Slogan）────────────────────────────────────────────────────
    setText('#heroSub', CFG.appSlogan);

    // ── 下载按钮文字（三处按钮的 span 统一刷一遍）──────────────────────────
    $$('[data-download] span').forEach(function (span) {
      span.textContent = CFG.downloadBtnText;
    });

    // ── 按钮下方小字说明 ───────────────────────────────────────────────────
    // 关键设计：链接没填时，这里必须明确告诉用户「还没开放下载」，
    // 否则用户点半天没反应会以为网站坏了。
    var noteText;
    if (hasDownload()) {
      noteText = CFG.downloadBtnNote;
    } else {
      noteText = '下载链接待公布 · ' + CFG.downloadBtnNote;
    }
    setText('#heroNote', noteText);

    // ── 底部 CTA 区的小字 ──────────────────────────────────────────────────
    if (hasDownload()) {
      setText('#ctaNote', CFG.downloadBtnNote);
    } else {
      setText('#ctaNote', '链接正在准备中，公布后会在这里直接变成可点击状态');
    }

    // ── 备用下载链接（只有 config 里填了 downloadUrlBackup 才出现）──────────
    renderBackupLink();
  }

  /**
   * 备用下载地址：以 .link-arrow 小链接的形式插在 #heroNote 后面。
   * 用 insertAdjacentElement 而不是 innerHTML 拼接，是为了不破坏 hero-note 的段落结构
   * （.hero-note 是 <p>，里面嵌 <a> 虽然合法但会让行高和间距变乱）。
   * .link-arrow 这个类 style.css 里已经定义好了（蓝色 + 箭头 + 悬停右移）。
   */
  function renderBackupLink() {
    var anchor = $('#heroNote');
    if (!anchor) return;

    // 先清掉可能已存在的（重复调用也只会有一条）
    var old = $('#backupDlLink');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    if (!CFG.downloadUrlBackup) return;

    var link = document.createElement('a');
    link.id = 'backupDlLink';
    link.className = 'link-arrow';
    link.href = CFG.downloadUrlBackup;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.marginTop = '10px';
    link.textContent = '备用下载地址';
    anchor.insertAdjacentElement('afterend', link);
  }


  /* ==========================================================================
   * [5] 渲染：数字统计
   *     结构必须是（style.css 里的 .stats 布局依赖这个层级）：
   *       <li class="stat">
   *         <div class="stat-num-row">
   *           <span class="stat-num">20</span>
   *           <span class="stat-suffix">+</span>
   *         </div>
   *         <span class="stat-label">累计拦截记录</span>
   *       </li>
   *     .stat-num 已经设了 font-variant-numeric: tabular-nums（等宽数字），
   *     所以滚动动画期间数字宽度不会来回抖，这是视觉上最关键的一点。
   * ======================================================================== */

  function renderStats() {
    var box = $('#stats');
    if (!box) return;

    var list = Array.isArray(CFG.stats) ? CFG.stats : [];
    if (!list.length) {
      // 没配数据就把区块整体隐藏，免得留一块空白怪怪的
      box.style.display = 'none';
      return;
    }

    box.innerHTML = list.map(function (item, i) {
      var value = Number(item && item.value) || 0;
      var suffix = esc(item && item.suffix);
      var label = esc(item && item.label);
      return '' +
        '<li class="stat">' +
          '<div class="stat-num-row">' +
            // data-target 存目标值，动画函数从它读；初始文字写 0
            '<span class="stat-num" data-target="' + value + '">0</span>' +
            (suffix ? '<span class="stat-suffix">' + suffix + '</span>' : '') +
          '</div>' +
          '<span class="stat-label">' + label + '</span>' +
        '</li>';
    }).join('');

    // 给每个 .stat 挂入场级联（注意这里不带 .reveal 也可以，
    // 但带上会让三个数字依次浮现，观感更好）
    applyReveal($$('.stat', box));

    // 数字滚动：等 #stats 进入视口再跑，避免用户在页面顶部时动画已经播完了
    whenVisible(box, function () {
      $$('.stat-num', box).forEach(function (numEl) {
        animateNumber(numEl);
      });
    });
  }

  /**
   * 把一个 .stat-num 从 0 滚到 data-target。
   * 用 requestAnimationFrame 而不是 setInterval：
   *   · rAF 跟屏幕刷新同步（多数手机 60Hz），视觉更顺
   *   · 页面切到后台时 rAF 自动暂停，不浪费电
   * 缓动函数 easeOutCubic：一开始快、结尾慢，符合「计数结束」的心理预期。
   */
  function animateNumber(el) {
    // 防止同一个元素被重复触发（比如视口来回滚动）导致数字乱跳
    if (el.dataset.done === '1') return;
    el.dataset.done = '1';

    var target = Number(el.dataset.target) || 0;

    // 用户开了「减少动画」无障碍选项时，直接给结果，不做动画
    if (prefersReducedMotion()) {
      el.textContent = String(target);
      return;
    }

    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / STAT_DURATION, 1);
      // easeOutCubic = 1 - (1 - t)^3
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // 收尾时强制写成精确值，避免四舍五入差 1
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(step);
  }


  /* ==========================================================================
   * [6] 渲染：功能卡片
   *     每张卡必须同时具备两个类，否则样式会不对：
   *       .feature-card          → 卡片本体（白底、圆角、阴影、悬停上浮）
   *       .accent-green/blue/…   → 注入 --accent / --accent-soft 两个变量，
   *                                顶部 3px 色条和图标底色全跟着它走
   *     再加上 .reveal + style="--i:n" → 滚动到该区域时依次浮现
   * ======================================================================== */

  var ACCENT_WHITELIST = ['green', 'blue', 'orange', 'purple'];

  function renderFeatures() {
    var box = $('#featureGrid');
    if (!box) return;

    var list = Array.isArray(CFG.features) ? CFG.features : [];
    if (!list.length) {
      box.innerHTML = '<p style="color:#6b7b90">功能列表还没配置，去 config.js 的 features 里加吧。</p>';
      return;
    }

    box.innerHTML = list.map(function (item) {
      // 主题色做白名单校验：万一 config 里手写成 'red'，这里退回 green，
      // 不会出现「色条消失」这种莫名其妙的 bug
      var accent = ACCENT_WHITELIST.indexOf(item && item.accent) > -1 ? item.accent : 'green';

      return '' +
        '<article class="feature-card accent-' + accent + '">' +
          '<div class="feature-icon">' +
            // 图标 SVG 只写 viewBox + 路径，颜色/描边宽度由 CSS 统一控制，
            // 所以我们能在 CSS 里一次改所有图标的粗细，不用改 9 次
            '<svg viewBox="0 0 24 24" aria-hidden="true">' + getIcon(item && item.icon) + '</svg>' +
          '</div>' +
          '<h3>' + esc(item && item.title) + '</h3>' +
          '<p>' + esc(item && item.desc) + '</p>' +
        '</article>';
    }).join('');

    applyReveal($$('.feature-card', box));
  }


  /* ==========================================================================
   * [7] 渲染：权限说明
   *     结构：
   *       <div class="perm-item status-required">
   *         <div class="perm-head">
   *           <span class="perm-dot"></span>
   *           <h3>无障碍权限</h3>
   *           <span class="perm-badge">必须</span>
   *         </div>
   *         <p>说明文字</p>
   *       </div>
   *     .status-* 类注入 --status-color / --status-soft，
   *     左侧 4px 边框、圆点、徽章底色、徽章文字色全部由这两个变量驱动。
   *     所以「必须 / 建议 / 可选」三种状态在配色上是自动区分的。
   * ======================================================================== */

  function renderPermissions() {
    var box = $('#permList');
    if (!box) return;

    var list = Array.isArray(CFG.permissions) ? CFG.permissions : [];
    if (!list.length) {
      box.style.display = 'none';
      return;
    }

    box.innerHTML = list.map(function (item) {
      var key = (item && item.status) || 'optional';
      var meta = STATUS_MAP[key] || STATUS_MAP.optional; // 未知状态按「可选」处理，最保守

      return '' +
        '<div class="perm-item ' + meta.cls + '">' +
          '<div class="perm-head">' +
            '<span class="perm-dot" aria-hidden="true"></span>' +
            '<h3>' + esc(item && item.name) + '</h3>' +
            '<span class="perm-badge">' + esc(meta.text) + '</span>' +
          '</div>' +
          '<p>' + esc(item && item.desc) + '</p>' +
        '</div>';
    }).join('');

    applyReveal($$('.perm-item', box));
  }


  /* ==========================================================================
   * [8] 渲染：更新日志时间轴
   *     结构：
   *       <div class="timeline">
   *         <div class="tl-item">
   *           <span class="tl-marker"></span>
   *           <div class="tl-body">
   *             <div class="tl-head">
   *               <strong>v8.1</strong>
   *               <span class="tl-date">2026-11-03</span>
   *               <span class="tl-tag">最新</span>
   *             </div>
   *             <ul class="tl-list"><li>…</li></ul>
   *           </div>
   *         </div>
   *       </div>
   *
   *     注意 CSS 里这条规则：
   *       .tl-item:not(:first-child) .tl-marker { 变成灰色 }
   *     也就是说「第一个点必须是实心绿色」——这代表最新版本。
   *     所以 config.js 里 changelog 的顺序必须「最新的在最前面」，
   *     千万不要为了好看去 sort 或 reverse，否则第一个点会标错版本。
   * ======================================================================== */

  function renderChangelog() {
    var box = $('#timeline');
    if (!box) return;

    var list = Array.isArray(CFG.changelog) ? CFG.changelog : [];
    if (!list.length) {
      box.style.display = 'none';
      return;
    }

    box.innerHTML = list.map(function (item) {
      var items = Array.isArray(item && item.items) ? item.items : [];

      // 只有最新版（tag 非空）才渲染小胶囊标签，其他版本自然没有
      var tagHtml = (item && item.tag)
        ? '<span class="tl-tag">' + esc(item.tag) + '</span>'
        : '';

      var listHtml = items.length
        ? '<ul class="tl-list">' + items.map(function (line) {
            return '<li>' + esc(line) + '</li>';
          }).join('') + '</ul>'
        : '';

      return '' +
        '<div class="tl-item">' +
          '<span class="tl-marker" aria-hidden="true"></span>' +
          '<div class="tl-body">' +
            '<div class="tl-head">' +
              '<strong>' + esc(item && item.version) + '</strong>' +
              '<span class="tl-date">' + esc(item && item.date) + '</span>' +
              tagHtml +
            '</div>' +
            listHtml +
          '</div>' +
        '</div>';
    }).join('');

    applyReveal($$('.tl-item', box));
  }


  /* ==========================================================================
   * [9] 渲染：作者 / 制作人
   *     这里只做「文字替换」和「备用链接显隐」两件事。
   *     主制作人「秋夜y」用叶子图标（秋叶 → 🍂 / 叶片 SVG）作为视觉标识，
   *     副制作人「墨」保留首字头像，这样即使没有头像图片，视觉上也不空。
   * ======================================================================== */

  function renderAuthors() {
    // ── 主制作人 ──────────────────────────────────────────────────────────
    setText('#authorName', CFG.authorName);
    setText('#authorTitle', CFG.authorTitle);

    // 主制作人头像：换成秋叶图标（SVG），不再用首字
    var mainAvatar = $('#authorAvatarMain');
    if (mainAvatar) {
      mainAvatar.innerHTML =
        '<svg class="avatar-leaf" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M20.5 3.5C13 3.2 6.6 6.1 4.4 11.6c-1.5 3.8.1 7 3.1 7.9 2.9.9 6-.4 7.7-2.9 1.7-2.6 1.6-5.7 1.1-8.2" ' +
            'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M4.9 19.1 13.6 10.4" ' +
            'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
        '</svg>';
    }

    // ── 副制作人（墨）────────────────────────────────────────────────────
    setText('#subAuthorName', CFG.subAuthorName);
    setText('#subAuthorTitle', CFG.subAuthorTitle);

    // 副制作人头像首字：取名字第一个字符
    var subInitialNode = $('#subAuthorInitial');
    if (subInitialNode && CFG.subAuthorName) {
      subInitialNode.textContent = String(CFG.subAuthorName).charAt(0);
    }

    // 平台说明为空时，隐藏它和后面的分隔点
    var platformNode = $('#subAuthorPlatform');
    if (platformNode) {
      if (CFG.subAuthorPlatform) {
        platformNode.textContent = CFG.subAuthorPlatform;
        platformNode.classList.remove('is-hidden');
      } else {
        platformNode.classList.add('is-hidden');
        var dotNode = $('#subAuthorDot');
        if (dotNode) dotNode.classList.add('is-hidden');
      }
    }

    // ── 副制作人主页按钮的显隐 ────────────────────────────────────────────
    // config.js 里 subAuthorLink 留空时，必须把按钮藏起来。
    // CSS 里已经写好了 .link-arrow.is-hidden { display: none; }，
    // 所以这里只需要切换这个类，不要在 JS 里写 style.display —— 
    // 那样以后想用 CSS 媒体查询在手机上重新显示它就做不到了。
    var link = $('#subAuthorLink');
    if (link) {
      if (CFG.subAuthorLink) {
        link.href = CFG.subAuthorLink;
        link.classList.remove('is-hidden');
      } else {
        link.href = '#';
        link.classList.add('is-hidden');
      }
    }

    // ── 页脚版权行 ────────────────────────────────────────────────────────
    setText('#footerCopy', '© ' + CFG.copyrightYear + ' ' + CFG.appName + ' · 制作人 ' + CFG.authorName);
  }


  /* ==========================================================================
   * [10] 渲染：FAQ 折叠面板
   *      用原生 <details>/<summary>，好处是：
   *        · 不需要 JS 也能展开收起（本脚本挂了也能用）
   *        · 系统自带展开动画的语义，读屏软件能正确朗读
   *      我们只用 JS 把「问题 / 答案」填进去，并补一个右侧箭头图标。
   *      CSS 里 .faq-item[open] .faq-icon { transform: rotate(90deg) }，
   *      所以箭头会随展开状态自动转向，这里不用管。
   * ======================================================================== */

  function renderFaq() {
    var box = $('#faqList');
    if (!box) return;

    var list = Array.isArray(CFG.faq) ? CFG.faq : [];
    if (!list.length) {
      box.style.display = 'none';
      return;
    }

    box.innerHTML = list.map(function (item) {
      return '' +
        '<details class="faq-item">' +
          '<summary>' +
            '<span>' + esc(item && item.q) + '</span>' +
            // 箭头图标：和 .link-arrow 里用的是同一个 chevron，保持全站图元一致
            '<svg class="faq-icon" viewBox="0 0 24 24" aria-hidden="true">' +
              '<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" ' +
              'stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</summary>' +
          '<div class="faq-answer"><p>' + esc(item && item.a) + '</p></div>' +
        '</details>';
    }).join('');

    applyReveal($$('.faq-item', box));
  }


  /* ==========================================================================
   * [11] 下载按钮统一逻辑
   *      页面上一共有三个下载入口（全部带 data-download 属性）：
   *        ① 导航栏右侧的小按钮  .nav-dl
   *        ② Hero 里的大按钮      #downloadBtn
   *        ③ 底部 CTA 区的大按钮
   *      三处的行为必须完全一致，所以统一用 querySelectorAll('[data-download]')
   *      绑定同一个处理函数。以后你想再加第四个入口，只要在 HTML 里给它
   *      加一个 data-download 属性，什么都不用改。
   *
   *      ── 现在的行为 ──────────────────────────────────────────────────────
   *      点击任意下载按钮 → 弹出「选择下载版本」弹窗（Android / Windows）
   *      → 用户点具体平台，才跳到 config.js 里对应的网盘直链。
   *      两个链接都没填时，仍然退化为 Toast「链接正在准备中」提示。
   *      ── 想改链接 ────────────────────────────────────────────────────────
   *      只改 config.js 的 downloadUrl（Android）/ windowsDownloadUrl（Windows）。
   * ======================================================================== */

  /** 当前是否已经有可用下载链接（去掉首尾空格后非空即视为有）*/
  function hasDownload() {
    return String(CFG.downloadUrl || '').trim() !== '' ||
           String(CFG.windowsDownloadUrl || '').trim() !== '';
  }

  /* ── 下载版本选择弹窗 ────────────────────────────────────────────────────
   * 点页面任意下载按钮 → 先弹窗让用户选平台（Android / Windows）
   * → 点具体选项才跳对应网盘链接。
   * 弹窗结构在 index.html 里（#dlModal），这里只负责显隐和填链接。
   * ---------------------------------------------------------------------- */

  var lastFocusNode = null;

  function openDlModal() {
    var modal = $('#dlModal');
    if (!modal) return;

    // 填链接 & 空链接的选项直接隐藏
    var aNode = $('#dlAndroid');
    var androidUrl = String(CFG.downloadUrl || '').trim();
    if (aNode) {
      if (androidUrl) { aNode.setAttribute('href', androidUrl); aNode.hidden = false; }
      else { aNode.hidden = true; }
    }

    var wNode = $('#dlWindows');
    var winUrl = String(CFG.windowsDownloadUrl || '').trim();
    if (wNode) {
      if (winUrl) { wNode.setAttribute('href', winUrl); wNode.hidden = false; }
      else { wNode.hidden = true; }
    }

    setText('#dlModalTitle', CFG.downloadModalTitle || '选择下载版本');
    setText('#dlModalDesc', CFG.downloadModalDesc || '按你的设备选择对应版本');

    lastFocusNode = document.activeElement;
    modal.hidden = false;
    // 下一帧再加 .is-open，让 CSS 的过渡动画能正常触发
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    document.body.classList.add('dl-modal-open');
  }

  function closeDlModal() {
    var modal = $('#dlModal');
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('dl-modal-open');
    // 等过渡结束再真正隐藏
    setTimeout(function () { modal.hidden = true; }, 220);
    if (lastFocusNode && lastFocusNode.focus) {
      try { lastFocusNode.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  function bindDlModal() {
    var modal = $('#dlModal');
    if (!modal) return;

    // 遮罩 / 关闭按钮
    $$('[data-dl-close]', modal).forEach(function (node) {
      node.addEventListener('click', function (e) {
        e.preventDefault();
        closeDlModal();
      });
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) closeDlModal();
    });

    // 点了某个平台（<a target="_blank"> 自己会开新窗口），顺手把弹窗收起来
    $$('.dl-option', modal).forEach(function (node) {
      node.addEventListener('click', function () {
        setTimeout(closeDlModal, 160);
      });
    });
  }

  function bindDownload() {
    var buttons = $$('[data-download]');
    if (!buttons.length) return;

    bindDlModal();

    buttons.forEach(function (node) {
      // 按钮不再直接挂链接：统一弹窗让用户选平台。
      // 保留 href="#" 只是为了让 <a> 形态的按钮有键盘焦点，点击会被拦住。
      if (node.tagName === 'A') node.setAttribute('href', '#');

      node.addEventListener('click', function (event) {
        event.preventDefault();
        // 两个链接都没填：还是回到「待公布」提示，避免弹出一个空弹窗
        if (!hasDownload()) {
          showToast(CFG.downloadPlaceholderTip);
          return;
        }
        openDlModal();
      });
    });
  }


  /* ==========================================================================
   * [12] Toast 提示条
   *      CSS 里 .toast 的初始状态是 opacity:0 + translate(-50%, 130%)，
   *      也就是「藏在自己下方、不可见」；只有加上 .show 才会滑上来。
   *      所以逻辑非常简单：加类 → 等一会儿 → 去类。
   *
   *      用一个模块级 timer 保存句柄，是为了处理「连续快速点击」的情况：
   *      如果不 clearTimeout，第 3 次点击时第 1 次的定时器到期会把 Toast 提前收走。
   * ======================================================================== */

  var toastTimer = null;

  function showToast(message) {
    var node = $('#toast');
    if (!node) return;

    node.textContent = String(message || '');
    node.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      node.classList.remove('show');
      toastTimer = null;
    }, TOAST_DURATION);
  }


  /* ==========================================================================
   * [13] 导航栏滚动毛玻璃
   *      页面在最顶部时导航栏是透明的（露出 Hero 的渐变背景，好看）；
   *      一旦往下滚，就加 .scrolled 变成白底毛玻璃 + 细阴影，
   *      保证白底区块上的导航文字依然清晰可读。
   *
   *      两个性能要点：
   *        · passive: true —— 告诉浏览器「我不会 preventDefault」，
   *          滚动时不用等 JS 执行完再绘制，滑动手感更跟手
   *        · 用 requestAnimationFrame 节流 —— 滚动事件在手机上每秒能触发上百次，
   *          每次都改 class 会造成不必要的样式重算
   * ======================================================================== */

  function initNavScroll() {
    var nav = $('#nav');
    if (!nav) return;

    var ticking = false;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y > NAV_SCROLL_THRESHOLD) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // 首次进来先跑一次：防止用户是带锚点打开的页面（比如 /#faq），
    // 一进来就已经在中间位置了，此时导航栏应该是实心态
    update();
  }


  /* ==========================================================================
   * [14] 入场动画
   *      CSS 里 .reveal 是「透明 + 下移 22px」，.reveal.is-in 才归位。
   *      我们用一个 IntersectionObserver 观察所有 .reveal 元素，
   *      进入视口就加 .is-in，然后立刻 unobserve（动画只播一次，
   *      来回滚动不会反复闪，这是体验上的关键细节）。
   *
   *      兜底：老浏览器（Android 5/6 的 WebView）没有 IntersectionObserver，
   *      此时直接给所有元素加 .is-in，让内容立刻可见 —— 绝不能因为
   *      动画不支持就让整页内容看不见。
   * ======================================================================== */

  var revealObserver = null;

  function initRevealObserver() {
    var nodes = $$('.reveal');
    if (!nodes.length) return;

    // 不支持 IO：直接全部显示
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    // 已经建过 observer 就复用（因为渲染是分区块调用的，可能多次进入这里）
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, {
        // 元素露出 12% 就开始播，用户不用等它完全进入视口
        threshold: 0.12,
        // 底部内缩 40px：这样元素刚露头时不会立刻播完，
        // 视觉上更容易被注意到（因为大多数人是往下滚，底部是「来向」）
        rootMargin: '0px 0px -40px 0px'
      });
    }

    nodes.forEach(function (n) {
      // 已经在视口里的（首屏那批）会被 observer 立刻回调，不用特殊处理
      revealObserver.observe(n);
    });
  }

  /**
   * 通用的「进入视口时执行一次」工具（数字滚动用它）。
   * 和上面的 reveal 分开写，是因为这里要执行的是回调函数而不是加类，
   * 而且只需要触发一次，语义不同，混在一起会让代码难读。
   */
  function whenVisible(el, callback) {
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        callback();
        io.disconnect(); // 只执行一次
      });
    }, { threshold: 0.25 });

    io.observe(el);
  }


  /* ==========================================================================
   * [15] 启动入口
   *     顺序有讲究：
   *       1) 先渲染所有内容（此时 DOM 里才有 .reveal 元素）
   *       2) 再绑定下载按钮（渲染 Hero 时按钮文字已经被改过，但 href 要在这里铺）
   *       3) 最后才初始化 observer / 滚动监听（因为要观察的元素这时才存在）
   *     如果顺序反了，observer 会观察不到动态插入的卡片，
   *     那些卡片就会永远停在「透明 + 下移」的状态 —— 页面看起来像没加载完。
   * ======================================================================== */

  function init() {
    // ── 第一阶段：纯渲染 ──────────────────────────────────────────────────
    renderBrand();
    renderHero();
    renderStats();
    renderFeatures();
    renderPermissions();
    renderChangelog();
    renderAuthors();
    renderFaq();

    // ── 第二阶段：交互绑定 ────────────────────────────────────────────────
    bindDownload();
    initNavScroll();

    // ── 第三阶段：动画系统 ────────────────────────────────────────────────
    initRevealObserver();

    // 调试开关：在网址后面加 ?debug=1 再打开页面，
    // 控制台就会打印出「最终合并后的配置对象」。
    // 作用：改完 config.js 后确认「到底是改了没生效，还是浏览器缓存没刷新」。
    if (window.location.search.indexOf('debug=1') > -1 && window.console) {
      console.log('[XY护盾官网] 当前配置：', CFG);
    }
  }

  /** 用户是否开启了系统的「减少动态效果」。
   *  Android 的「移除动画」开关、iOS 的「减弱动态效果」都会让这个返回 true。
   *  尊重这个设置是无障碍的基本要求：有人对位移动画会晕。 */
  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // ── 真正启动 ──────────────────────────────────────────────────────────────
  // defer 已经保证 DOM 就绪，这里再做一次判断是为了「有人手改 HTML 删掉 defer」时也不崩
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
