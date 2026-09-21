document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ========================================
     要素の取得
     ======================================== */

  const siteHeader = document.getElementById("site-header");

  const menuOpenButton = document.getElementById("menu-open");
  const menuCloseButton = document.getElementById("menu-close");

  const siteDrawer = document.getElementById("site-drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");

  const searchContainer = document.getElementById("search-container");
  const searchToggle = document.getElementById("search-toggle");
  const searchForm = document.getElementById("site-search");
  const searchInput = document.getElementById("search-input");

  const currentAreaName = document.getElementById("current-area-name");


  /* ========================================
     現在のエリア名を判定
     ======================================== */

  function updateCurrentArea() {
    const path = window.location.pathname.toLowerCase();

    let areaName = "BOTL";

    if (path.startsWith("/main-image")) {
      areaName = "Images";
    } else if (path.startsWith("/main-game")) {
      areaName = "Games";
    } else if (path.startsWith("/main-database")) {
      areaName = "Database";
    } else if (path.startsWith("/support")) {
      areaName = "Efa";
    }

    if (currentAreaName) {
      currentAreaName.textContent = areaName;
    }

    document.body.dataset.area = areaName.toLowerCase();
  }

  updateCurrentArea();


  /* ========================================
     メニューの開閉
     ======================================== */

  let lastFocusedElement = null;

  function openMenu() {
    lastFocusedElement = document.activeElement;

    siteDrawer.classList.add("is-open");
    drawerBackdrop.hidden = false;

    // 次のフレームでアニメーションを開始
    requestAnimationFrame(() => {
      drawerBackdrop.classList.add("is-visible");
    });

    siteDrawer.setAttribute("aria-hidden", "false");
    siteDrawer.removeAttribute("inert");

    menuOpenButton.setAttribute("aria-expanded", "true");

    document.body.style.overflow = "hidden";

    menuCloseButton.focus();
  }

  function closeMenu() {
    siteDrawer.classList.remove("is-open");
    drawerBackdrop.classList.remove("is-visible");

    siteDrawer.setAttribute("aria-hidden", "true");
    siteDrawer.setAttribute("inert", "");

    menuOpenButton.setAttribute("aria-expanded", "false");

    document.body.style.overflow = "";

    window.setTimeout(() => {
      if (!siteDrawer.classList.contains("is-open")) {
        drawerBackdrop.hidden = true;
      }
    }, 300);

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    } else {
      menuOpenButton.focus();
    }
  }

  menuOpenButton.addEventListener("click", openMenu);
  menuCloseButton.addEventListener("click", closeMenu);
  drawerBackdrop.addEventListener("click", closeMenu);


  /* ========================================
     Escapeキー
     ======================================== */

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (siteDrawer.classList.contains("is-open")) {
      closeMenu();
      return;
    }

    if (searchContainer.classList.contains("is-open")) {
      closeSearch();
    }
  });


  /* ========================================
     検索欄
     ======================================== */

  function openSearch() {
    searchContainer.classList.add("is-open");
    searchToggle.setAttribute("aria-expanded", "true");
    searchToggle.setAttribute("aria-label", "検索欄を閉じる");

    searchInput.focus();
  }

  function closeSearch() {
    searchContainer.classList.remove("is-open");
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", "検索欄を開く");
  }

  searchToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    if (searchContainer.classList.contains("is-open")) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  document.addEventListener("click", (event) => {
    if (!searchContainer.contains(event.target)) {
      closeSearch();
    }
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
      return;
    }

    /*
      現時点では検索ページが未実装のため、
      検索語をURLパラメータとして保存する。

      後から専用の検索ページを作成した際に
      この部分を検索処理へ変更する。
    */

    const searchUrl =
      "{{ '/support/search/' | relative_url }}" +
      "?q=" +
      encodeURIComponent(query);

    window.location.href = searchUrl;
  });


  /* ========================================
     メニュー内リンクの処理
     ======================================== */

  const drawerLinks = siteDrawer.querySelectorAll("a");

  drawerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });


  /* ========================================
     ページ読み込み時の初期状態
     ======================================== */

  siteDrawer.setAttribute("inert", "");
});
