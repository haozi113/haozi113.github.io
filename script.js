/* =========================================================
   个人主页交互脚本
   包含：主题切换、移动端菜单、滚动状态、入场动画、
        数字滚动、打字机效果、复制邮箱、回到顶部
   ========================================================= */

(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- 1. 主题切换 ---------- */
  const root = document.documentElement;
  const themeToggle = $('#themeToggle');

  function syncThemeColor() {
    const isDark = root.dataset.theme === 'dark';
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#0a0c11' : '#f5f6fa');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* 忽略 */ }
      syncThemeColor();
    });
  }

  // 用户没手动选过时，跟随系统主题变化
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      try { if (localStorage.getItem('theme')) return; } catch (err) { /* 忽略 */ }
      root.dataset.theme = e.matches ? 'dark' : 'light';
      syncThemeColor();
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  syncThemeColor();

  /* ---------- 2. 移动端菜单 ---------- */
  const menuToggle = $('#menuToggle');
  const navMenu = $('#navMenu');

  function closeMenu() {
    if (!navMenu || !menuToggle) return;
    navMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开菜单');
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });

    $$('.nav-link').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('is-open')) return;
      if (navMenu.contains(e.target) || menuToggle.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- 3. 滚动：顶栏状态 + 回到顶部 ---------- */
  const header = $('#siteHeader');
  const toTop = $('#toTop');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 12);
    if (toTop) toTop.classList.toggle('is-on', y > 600);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 4. 入场动画 ---------- */
  const reveals = $$('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 5. 数字滚动 ---------- */
  const counters = $$('[data-count]');

  function runCounter(el) {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = (el.dataset.count || '') + (el.dataset.suffix || '');
    });
  }

  /* ---------- 6. 打字机效果 ---------- */
  const typed = $('#typed');

  if (typed) {
    const words = ['数学建模爱好者', '上海师范大学大三学生', '数据分析学习者', '竞赛参与者'];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      typed.textContent = words[0];
    } else {
      let wordIndex = 0, charIndex = words[0].length, deleting = false;

      function tick() {
        const word = words[wordIndex];

        if (!deleting) {
          charIndex += 1;
          typed.textContent = word.slice(0, charIndex);
          if (charIndex >= word.length) {
            deleting = true;
            return setTimeout(tick, 1600);
          }
          return setTimeout(tick, 110);
        }

        charIndex -= 1;
        typed.textContent = word.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          return setTimeout(tick, 380);
        }
        return setTimeout(tick, 55);
      }

      setTimeout(tick, 1500);
    }
  }

  /* ---------- 7. 导航高亮 ---------- */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link');

  if ('IntersectionObserver' in window && sections.length) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((s) => so.observe(s));
  }

  /* ---------- 8. 复制到剪贴板 ---------- */
  const toast = $('#toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2000);
  }

  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.cssText = 'position:absolute;left:-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        showToast('已复制：' + text);
      } catch (err) {
        showToast('复制失败，请手动复制：' + text);
      }
    });
  });

  /* ---------- 9. 数字分身：离线知识库 + 真 AI ----------
     两种接法，二选一：
     A【当前启用】直连智谱：不需要服务器，浏览器直接调用，国内能访问。
       代价：Key 会出现在这份公开代码里。作业演示够用，演示完请去智谱后台删掉这个 Key。
     B【更安全】自建代理：把 TWIN_API 填成你的 Worker 地址，Key 只存在服务端。
       注意 workers.dev 域名在国内被 DNS 污染，必须绑定自己的域名才能用。 */
  const TWIN_API = '';            // B 方案：代理地址，留空表示不用

  const ZHIPU = {                 // A 方案：直连配置
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    key: '0fe23b0fac3c43f9ac8cc7ce2047a3db.tbT1mlZEP3ShXpnJ',
    // 按实测速度排序（2026-10-14 测：250414 约 0.6s，4-flash 约 2.8s，4.5-flash 约 3.2s）
    // 注意 glm-4.7-flash 实测要 20~65 秒，太慢，已从候选里去掉
    models: ['glm-4-flash-250414', 'glm-4-flash', 'glm-4.5-flash'],
  };

  const chatLog = $('#chatLog');
  const chatForm = $('#chatForm');
  const chatInput = $('#chatInput');

  if (chatLog && chatForm && chatInput) {
    const EMAIL = '1000572273@smail.shnu.edu.cn';
    const directMode = TWIN_API.trim().length === 0 && ZHIPU.key.length > 0;
    const useAI = TWIN_API.trim().length > 0 || directMode;

    // 知识库：每条 = 触发词 + 我的真实资料。
    // 改资料时先改根目录的《分身说明书.md》，再同步到这里，两边保持一致。
    const KB = [
      {
        keys: ['做什么', '在做什么', '最近', '现在', '状态', '大几', '年级', '学校', '专业', '读什么', '介绍'],
        a: '上海师范大学计算机科学与技术专业，大三。最近主要把时间放在数学建模上，接下来一年的主线是准备考研，方向往数据分析和建模靠。',
      },
      {
        keys: ['竞赛', '比赛', '获奖', '奖', '荣誉', '名次'],
        a: '我一共参加过 4 项竞赛，拿到 3 个奖：数学竞赛省级二等奖、数学建模 MathorCup 省级二等奖、数字化化学实验创新设计比赛上海赛区三等奖。全国大学生数学建模竞赛（国赛）我也完整参加了，成绩还没到公布时间。',
      },
      {
        keys: ['建模', '模型', '数模', '水平'],
        a: '数学建模是我投入最多的方向。我比较在意模型是不是真的解释了那个问题，而不是套一个多复杂的公式。流程上从读题、选模型、跑数据到排版论文，我都会完整走一遍。',
      },
      {
        keys: ['工具', '技能', '软件', 'python', 'matlab', 'latex', 'excel', '擅长', '会什么'],
        a: 'Python 和 MATLAB 用得最多，论文排版靠 LaTeX，Excel 和数据可视化也一直在用。建模这块，从读题、选模型、跑数据到排版论文，我都会完整走一遍。',
      },
      {
        keys: ['实习', '工作', '求职', '招聘', '简历', '就业'],
        a: '我目前还没有实习经历。之前主要精力放在竞赛和课程上，接下来会专注考研，也会留意数据分析方向的机会。',
      },
      {
        keys: ['联系', '邮箱', '微信', '电话', '找你', '合作'],
        a: '发邮件最方便：' + EMAIL + '，我通常会在 1 到 2 个工作日内回复。',
      },
      {
        keys: ['主页', '网站', '这个页面', '技术', '怎么做的'],
        a: '这个主页是纯静态的 HTML、CSS 和 JavaScript，没有框架也没有后端，双击文件就能打开，也能直接托管在 GitHub Pages 上。',
      },
      {
        keys: ['手机号', '电话', '住址', '身份证', '成绩单', '隐私', '家庭'],
        a: '这些私人信息我不会放在公开页面上。如果确实需要，请发邮件到 ' + EMAIL + '，由我本人回复你。',
      },
      {
        keys: ['评价', '比较', '谁更', '你觉得', '好不好'],
        a: '别人的事我不方便评价，只讲我自己的情况。你想知道我的哪一段经历，我可以细说。',
      },
      {
        keys: ['以后', '将来', '未来', '规划', '打算', '考研', '保研', '目标', '想做什么', '想干嘛'],
        a: '打算考研，方向还是数据分析和建模相关。我也知道自己有时候不够主动，所以这次想早点动手，把计划拆细一点执行。',
      },
      {
        keys: ['性格', '爱好', '兴趣', '平时', '羽毛球', '美食', '什么样的人', '自我'],
        a: '偏沉稳，不太爱张扬，安静做事的时候效率最高。平时喜欢寻觅美食，也常打羽毛球。缺点是有时候不够主动，容易往后拖，这是我一直想改的。',
      },
      {
        keys: ['成绩', '绩点', 'gpa', '六级', '英语', '四六级'],
        a: '平均绩点 3.1 左右，英语六级 457 分。不算亮眼，属于还有提升空间的水平，我也不想把它说得更好看。',
      },
      {
        keys: ['写作业', '帮我写', '写代码', '天气', '新闻', '作业'],
        a: '这个不在我的职责范围里——我只是钱俊昊的数字分身，负责回答和他本人有关的问题。',
      },
    ];

    const FALLBACK = '这个我确实不知道，我不想瞎编——我现在只是个离线的预设问答分身，只回答我确实知道的事。你可以换个问法，或者直接发邮件问我：' + EMAIL;

    function findAnswer(question) {
      const q = String(question).toLowerCase().replace(/\s/g, '');
      let best = null;
      let bestScore = 0;
      KB.forEach((item) => {
        let score = 0;
        item.keys.forEach((k) => { if (q.includes(k.toLowerCase())) score += k.length; });
        if (score > bestScore) { bestScore = score; best = item; }
      });
      return best ? best.a : FALLBACK;
    }

    function addMessage(text, from) {
      const bubble = document.createElement('div');
      bubble.className = 'msg ' + (from === 'me' ? 'msg-me' : 'msg-bot');
      bubble.textContent = text;
      chatLog.appendChild(bubble);
      chatLog.scrollTop = chatLog.scrollHeight;
      return bubble;
    }

    // 最近的对话，让分身记得上下文（最多 3 轮）
    const history = [];

    // 走真模型：只请求自己的代理地址，Key 在服务端
    async function askAI(question) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      try {
        const res = await fetch(TWIN_API.replace(/\/+$/, '') + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: question, history: history.slice(-6) }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.answer) throw new Error(data.error || ('HTTP ' + res.status));
        return data.answer;
      } finally {
        clearTimeout(timer);
      }
    }

    /* 直连模式用的人设与样本，内容和 server/worker.js 保持一致（改一处记得改另一处） */
    const PERSONA = `你是钱俊昊本人放在个人主页上的数字分身，访客来问，你替他回答。

【唯一职责】
介绍他是谁、回答和他本人有关的问题、帮访客知道怎么联系他。
你不是通用助手，也不是百科全书：写作业、写代码、查天气、聊时事这类请求，礼貌说明这不是你的范围。

【关于他，你只知道下面这些，没写的就不知道】
- 身份：上海师范大学，计算机科学与技术专业，本科在读，大三
- 所在地：上海
- 性格：偏沉稳，不爱张扬；缺点是有时候不够主动，正在改
- 爱好：寻觅美食、打羽毛球
- 学业：平均绩点 3.1 左右，英语六级 457 分
- 方向：数学建模、数据分析；接下来一年的主线是考研
- 竞赛：数学竞赛省级二等奖；数学建模 MathorCup 省级二等奖；数字化化学实验创新设计比赛上海赛区三等奖（小组制、结合数字化实验）；全国大学生数学建模竞赛（国赛）完整参加过，成绩还没到公布时间
- 常用工具：Python、MATLAB、LaTeX、Excel 与数据可视化
- 实习：暂时没有
- 联系：1000572273@smail.shnu.edu.cn，通常 1 到 2 个工作日回复

【说话方式】
- 你就是"我"。全程第一人称，不要出现"钱俊昊""他"这种第三人称的说法，
  需要留联系方式时就说"发邮件给我"，不要说"联系钱俊昊"。
- 先给结论，再补一句原因，一般两到三句，最多四句。
- 问工具、问竞赛这类，不要逐条念清单，挑最相关的两三个说，别写得像简历。
- 中文口语，不装专家，不客套，不堆 emoji，不说"很荣幸"。
- 不吹自己，也不刻意谦虚；提到不足照实说。
- 除非访客直接问你是不是 AI，否则不要说"根据我的资料""作为数字分身"这类话。

【不知道的时候】
- 直接说"这个我没有提供过"或"我不太清楚"，再给一条出路：换个问法，或者发邮件到上面的邮箱。
- 绝不编造经历、奖项、分数、排名、时间、项目。

【边界】
- 手机号、住址、身份证、成绩单等私人信息：说明不在公开页面提供，让访客发邮件。
- 评价他人、比较学校机构：只讲自己的事，不做评价。
- 替本人做承诺或预测（能不能考上、以后一定怎样）：说明替他做不了这个承诺。`;

    const SAMPLES = [
      { role: 'user', content: '你现在在做什么？' },
      { role: 'assistant', content: '上海师范大学计算机科学与技术专业，大三。最近主要把时间放在数学建模上，也正在找数据分析方向的实习，或者跟老师做点实际课题。' },
      { role: 'user', content: '你参加过哪些竞赛？' },
      { role: 'assistant', content: '参加过四项，拿了三个奖。数学竞赛省级二等奖、数学建模 MathorCup 省级二等奖，还有上海市大学生化学实验竞赛的上海赛区三等奖。国赛我也完整打过一遍，那次没拿奖。' },
      { role: 'user', content: '你数学建模水平怎么样？' },
      { role: 'assistant', content: '投入最多的方向。我比较在意模型是不是真的解释了那个问题，而不是套一个多复杂的公式。从读题、选模型、跑数据到排版论文，我都会完整走一遍。' },
      { role: 'user', content: '你会哪些工具？' },
      { role: 'assistant', content: 'Python 和 MATLAB 用得最多，论文排版靠 LaTeX，Excel 和数据可视化也一直在用。' },
      { role: 'user', content: '你有实习经历吗？' },
      { role: 'assistant', content: '暂时还没有。正在找数据分析方向的实习，有合适的机会可以直接发邮件给我。' },
      { role: 'user', content: '帮我写一篇课程论文吧' },
      { role: 'assistant', content: '这个我帮不了，论文得你自己写。要是想聊建模或者数据方向的事，发邮件给我就行。' },
      { role: 'user', content: '你高考考了多少分？' },
      { role: 'assistant', content: '这个我没在主页上写过，就不细说了。你想了解别的，换个问法，或者直接发邮件问我。' },
      { role: 'user', content: '你平时有什么爱好？' },
      { role: 'assistant', content: '喜欢寻觅美食，也常打羽毛球。平时话不多，安静做事的时候效率最高。' },
      { role: 'user', content: '你的成绩怎么样？' },
      { role: 'assistant', content: '平均绩点 3.1 左右，英语六级 457 分。不算亮眼，还有提升空间。' },
      { role: 'user', content: '你打算考研吗？' },
      { role: 'assistant', content: '打算。方向还是数据分析和建模相关。我知道自己有时候不够主动，所以这次想早点动手。' },
    ];

    // A 方案：浏览器直连智谱，前面的模型拥堵就自动换下一个
    async function askZhipu(question) {
      let lastError = '';
      for (const model of ZHIPU.models) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);   // 单个模型最多等 12 秒就换下一个
        try {
          const res = await fetch(ZHIPU.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ZHIPU.key },
            body: JSON.stringify({
              model: model,
              messages: [{ role: 'system', content: PERSONA }, ...SAMPLES, ...history, { role: 'user', content: question }],
              max_tokens: 350,
              temperature: 0.4,
              stream: false,
            }),
            signal: controller.signal,
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.choices || !data.choices[0]) {
            lastError = (data.error && data.error.message) || ('HTTP ' + res.status);
            continue;   // 拥堵或被拒，换下一个模型
          }
          const answer = data.choices[0].message && data.choices[0].message.content;
          if (answer) return answer.trim();
          lastError = '模型没有返回内容';
        } catch (err) {
          lastError = err.message;
        } finally {
          clearTimeout(timer);
        }
      }
      throw new Error(lastError || '所有模型都没能回答');
    }

    let busy = false;

    async function sendQuestion(raw) {
      const text = String(raw || '').trim();
      if (!text || busy) return;
      addMessage(text, 'me');
      chatInput.value = '';

      if (!useAI) {
        setTimeout(() => addMessage(findAnswer(text), 'bot'), 320);
        return;
      }

      busy = true;
      const bubble = addMessage('正在想…', 'bot');
      bubble.classList.add('msg-wait');
      try {
        const answer = directMode ? await askZhipu(text) : await askAI(text);
        bubble.textContent = answer;
        history.push({ role: 'user', content: text }, { role: 'assistant', content: answer });
        if (history.length > 6) history.splice(0, history.length - 6);
      } catch (err) {
        bubble.textContent = findAnswer(text);
        const note = document.createElement('small');
        note.className = 'msg-note';
        note.textContent = '（AI 接口暂时连不上，这条来自离线知识库：' + err.message + '）';
        bubble.appendChild(note);
      } finally {
        bubble.classList.remove('msg-wait');
        busy = false;
        chatLog.scrollTop = chatLog.scrollHeight;
      }
    }

    // 接了真模型就把状态文案改掉，别让页面说谎
    if (useAI) {
      const ver = $('#twinVer');
      const status = $('#twinStatus');
      const sub = $('#twinSub');
      if (ver) ver.textContent = directMode ? 'v0.3 · 已接入智谱免费模型' : 'v0.3 · 已接入 AI（自建代理）';
      if (status) status.textContent = '在线，回答由 AI 生成，但边界和资料还是我定的';
      if (sub) sub.textContent = '下面这个小助手由 AI 驱动，只依据我整理的《分身说明书》回答；答不上来它会直说，接口不通时自动回落到预设问答。';
    }

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendQuestion(chatInput.value);
    });

    $$('#chatChips button').forEach((btn) => {
      btn.addEventListener('click', () => sendQuestion(btn.dataset.q));
    });
  }

  /* ---------- 10. 数字分身的浮动入口 ---------- */
  const chatLauncher = $('#chatLauncher');
  const twinSection = $('#twin');

  if (chatLauncher && twinSection && chatInput) {
    chatLauncher.addEventListener('click', () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      twinSection.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (chatInput.focus) {
        setTimeout(() => chatInput.focus({ preventScroll: true }), reduce ? 0 : 600);
      }
    });

    // 人已经站在问答区里了，就把浮动按钮收起来，避免挡内容
    if ('IntersectionObserver' in window) {
      const launcherObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          chatLauncher.classList.toggle('is-hidden', entry.isIntersecting);
        });
      }, { threshold: 0.12 });
      launcherObserver.observe(twinSection);
    }
  }

  /* ---------- 11. 页脚年份 ---------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
