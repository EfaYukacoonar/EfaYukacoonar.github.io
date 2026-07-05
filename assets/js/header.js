// スクロール検知
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  const header = document.querySelector('header');
  if (currentScroll > lastScroll) {
    header.classList.add('header-hidden');
  } else {
    header.classList.remove('header-hidden');
  }
  lastScroll = currentScroll;
});

// 検索バーの「外側クリックで閉じる」処理
document.addEventListener('click', (e) => {
  const searchBar = document.querySelector('.search-container');
  if (!searchBar.contains(e.target)) {
    // ここで閉じる処理（input値はDOMに残るため自動で維持されます）
    searchBar.classList.remove('is-open');
  }
});
