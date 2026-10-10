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

  /* ---------- 9. 数字分身：离线预设问答 ---------- */
  const chatLog = $('#chatLog');
  const chatForm = $('#chatForm');
  const chatInput = $('#chatInput');

  if (chatLog && chatForm && chatInput) {
    const EMAIL = '1000572273@smail.shnu.edu.cn';

    // 知识库：每条 = 触发词 + 我的真实资料。
    // 改资料时先改根目录的《分身说明书.md》，再同步到这里，两边保持一致。
    const KB = [
      {
        keys: ['做什么', '在做什么', '最近', '现在', '状态', '大几', '年级', '学校', '专业', '读什么', '介绍'],
        a: '我现在是上海师范大学计算机科学与技术专业的本科在读生，大三。最近主要把时间放在数学建模上，同时也在找数据分析方向的实习或者跟老师做实际课题。',
      },
      {
        keys: ['竞赛', '比赛', '获奖', '奖', '荣誉', '名次'],
        a: '我一共参加过 4 项竞赛，拿到 3 个奖：数学竞赛省级二等奖、数学建模 MathorCup 省级二等奖、上海市大学生化学实验竞赛（含实验创新设计）上海赛区三等奖；此外还完整参加了全国大学生数学建模竞赛（国赛）。',
      },
      {
        keys: ['建模', '模型', '数模', '水平'],
        a: '数学建模是我投入最多的方向。我比较在意模型是不是真的解释了那个问题，而不是套一个多复杂的公式。流程上从读题、选模型、跑数据到排版论文，我都会完整走一遍。',
      },
      {
        keys: ['工具', '技能', '软件', 'python', 'matlab', 'latex', 'excel', '擅长', '会什么'],
        a: '最常用的是 Python、MATLAB 和 LaTeX，Excel 和数据可视化也一直在用。能力上集中在数学建模：读题与模型选型、数据处理与分析、求解与结果检验、论文写作与排版。',
      },
      {
        keys: ['实习', '工作', '求职', '招聘', '简历', '就业'],
        a: '我目前还没有实习经历，正在找数据分析方向的实习，或者跟老师做一点实际课题。如果你有合适的机会，欢迎发邮件给我。',
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
        a: '方向上是数据分析和建模相关，但具体还没定死，我不太想给自己说不准的承诺。等有了确定的计划，我会更新到主页上。',
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
    }

    function sendQuestion(raw) {
      const text = String(raw || '').trim();
      if (!text) return;
      addMessage(text, 'me');
      chatInput.value = '';
      setTimeout(() => addMessage(findAnswer(text), 'bot'), 320);
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
