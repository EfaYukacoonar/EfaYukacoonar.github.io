document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const searchBox = document.querySelector('.search-box');
  const searchInput = document.getElementById('search-input');
  
  // スクロールで隠れる
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    let current = window.pageYOffset;
    header.style.transform = current > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
    lastScroll = current;
  });

  // 検索バー制御
  document.querySelector('.search-trigger').addEventListener('click', (e) => {
    searchBox.classList.add('open');
    searchInput.focus();
    e.stopPropagation();
  });

  // 外側タップで閉じる
  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target)) {
      searchBox.classList.remove('open');
    }
  });
});
