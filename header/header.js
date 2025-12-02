// header hide/show on scroll (common pattern: hide on scroll down, show on scroll up)
(() => {
  const header = document.getElementById('site-header');
  let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const current = window.pageYOffset || document.documentElement.scrollTop;
        const delta = current - lastScroll;

        // if scrolling down (delta > 0) -> hide header
        // if scrolling up (delta < 0) -> show header
        if (current <= 10) {
          header.classList.remove('hidden'); // always show near top
        } else if (delta > 5) {
          header.classList.add('hidden');
        } else if (delta < -5) {
          header.classList.remove('hidden');
        }

        lastScroll = current <= 0 ? 0 : current;
        ticking = false;
      });
      ticking = true;
    }
  }, {passive:true});

  // ハンバーガーメニューの開閉
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');
  const sideClose = document.getElementById('side-close');

  function openSide() {
    sideMenu.classList.add('open');
    sideMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // optional: prevent body scroll while menu open
  }
  function closeSide() {
    sideMenu.classList.remove('open');
    sideMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    if (sideMenu.classList.contains('open')) closeSide();
    else openSide();
  });
  sideClose.addEventListener('click', closeSide);
  // click outside to close
  document.addEventListener('click', (e) => {
    if (!sideMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeSide();
    }
  });

  // ユーザードロップダウン
  const userToggle = document.getElementById('user-toggle');
  const userDropdown = document.getElementById('user-dropdown');

  function openUser() {
    userDropdown.style.display = 'flex';
    userDropdown.setAttribute('aria-hidden', 'false');
    userToggle.setAttribute('aria-expanded', 'true');
  }
  function closeUser() {
    userDropdown.style.display = 'none';
    userDropdown.setAttribute('aria-hidden', 'true');
    userToggle.setAttribute('aria-expanded', 'false');
  }

  userToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userDropdown.style.display === 'flex') closeUser();
    else openUser();
  });

  document.addEventListener('click', (e) => {
    if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
      closeUser();
    }
  });

  // Escape で閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSide();
      closeUser();
    }
  });

})();
