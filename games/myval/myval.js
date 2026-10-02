(() => {
  const app = document.querySelector('#myval-app');

  if (!app) {
    return;
  }

  /*
   * The shared header already exists.
   * Only change the current-area text for this page.
   */
  const headerArea = document.querySelector('#current-area-name');

  if (headerArea) {
    headerArea.textContent = 'MyVal';
  }


  const tabs = [...app.querySelectorAll('[data-tab]')];
  const panels = [...app.querySelectorAll('[data-panel]')];


  function activateTab(name) {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;

      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });


    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;

      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  }


  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.tab);
    });


    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      const nextIndex =
        event.key === 'ArrowRight'
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;

      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex].dataset.tab);
    });
  });


  activateTab('matches');
})();
