// スクロール制御
let lastScroll = 0;
const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
  let currentScroll = window.pageYOffset;
  header.style.transform = currentScroll > lastScroll ? "translateY(-100%)" : "translateY(0)";
  lastScroll = currentScroll;
});

// 検索バーの挙動
const searchWrapper = document.querySelector('.search-wrapper');
const searchInput = document.getElementById('search-input');

document.addEventListener('click', (e) => {
  // 検索バーの内側をクリックした時は開く
  if (searchWrapper.contains(e.target)) {
    searchWrapper.classList.add('active');
  } else {
    // 検索バーの外側をクリックしたら閉じる
    searchWrapper.classList.remove('active');
  }
});
