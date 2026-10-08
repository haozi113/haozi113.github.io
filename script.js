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

  /* ---------- 9. 页脚年份 ---------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
