(() => {
  const app = document.querySelector('#myval-app');

  if (!app) {
    return;
  }


  /* =====================================================
     SHARED HEADER
     ===================================================== */

  const headerArea = document.querySelector('#current-area-name');

  if (headerArea) {
    headerArea.textContent = 'MyVal';
  }


  /* =====================================================
     MAIN TABS
     ===================================================== */

  const tabs = [
    ...app.querySelectorAll('[data-tab]')
  ];

  const panels = [
    ...app.querySelectorAll('[data-panel]')
  ];


  function activateTab(name) {

    tabs.forEach((tab) => {

      const active =
        tab.dataset.tab === name;

      tab.classList.toggle(
        'is-active',
        active
      );

      tab.setAttribute(
        'aria-selected',
        String(active)
      );

      tab.tabIndex =
        active ? 0 : -1;
    });


    panels.forEach((panel) => {

      const active =
        panel.dataset.panel === name;

      panel.hidden = !active;

      panel.classList.toggle(
        'is-active',
        active
      );
    });
  }


  tabs.forEach((tab, index) => {

    tab.addEventListener(
      'click',
      () => {
        activateTab(
          tab.dataset.tab
        );
      }
    );


    tab.addEventListener(
      'keydown',
      (event) => {

        if (
          ![
            'ArrowLeft',
            'ArrowRight'
          ].includes(event.key)
        ) {
          return;
        }

        event.preventDefault();


        const nextIndex =
          event.key === 'ArrowRight'
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;


        tabs[nextIndex].focus();

        activateTab(
          tabs[nextIndex].dataset.tab
        );
      }
    );
  });


  /* =====================================================
     MATCH MODES
     
     These are intentionally data-driven.
     If VALORANT adds another mode later,
     add one object here.
     ===================================================== */

  const GAME_MODES = [

    {
      id: 'all',
      label: 'ALL'
    },

    {
      id: 'competitive',
      label: 'COMPETITIVE'
    },

    {
      id: 'unrated',
      label: 'UNRATED'
    },

    {
      id: 'swiftplay',
      label: 'SWIFTPLAY'
    },

    {
      id: 'premier',
      label: 'PREMIER'
    },

    {
      id: 'spike-rush',
      label: 'SPIKE RUSH'
    },

    {
      id: 'deathmatch',
      label: 'DEATHMATCH'
    },

    {
      id: 'team-deathmatch',
      label: 'TEAM DEATHMATCH'
    },

    {
      id: 'escalation',
      label: 'ESCALATION'
    },

    {
      id: 'retake',
      label: 'RETAKE'
    },

    {
      id: 'skirmish',
      label: 'SKIRMISH'
    },

    {
      id: 'gauntlet-glitch',
      label: 'GAUNTLET: GLITCH'
    },

    {
      id: 'custom',
      label: 'CUSTOM'
    },

    {
      id: 'other',
      label: 'OTHER'
    }

  ];


  /* =====================================================
     DEMO MATCH DATA
     ===================================================== */

  const MATCHES = [

    {
      result: 'win',
      rr: '+18 RR',
      map: 'Ascent',
      mode: 'competitive',
      modeLabel: 'Competitive',
      time: '32m ago',
      agent: 'J',
      agentName: 'Jett',
      score: '13 : 11',
      outcome: 'Victory',
      acs: '298',
      kda: '24/16/8'
    },

    {
      result: 'loss',
      rr: '-22 RR',
      map: 'Icebox',
      mode: 'competitive',
      modeLabel: 'Competitive',
      time: '2h ago',
      agent: 'J',
      agentName: 'Jett',
      score: '11 : 13',
      outcome: 'Defeat',
      acs: '278',
      kda: '21/19/7'
    },

    {
      result: 'win',
      rr: '+19 RR',
      map: 'Haven',
      mode: 'competitive',
      modeLabel: 'Competitive',
      time: '5h ago',
      agent: 'S',
      agentName: 'Sova',
      score: '13 : 9',
      outcome: 'Victory',
      acs: '244',
      kda: '19/12/10'
    },

    {
      result: 'win',
      rr: '',
      map: 'Lotus',
      mode: 'swiftplay',
      modeLabel: 'Swiftplay',
      time: '7h ago',
      agent: 'K',
      agentName: 'Killjoy',
      score: '5 : 3',
      outcome: 'Victory',
      acs: '242',
      kda: '15/7/5'
    },

    {
      result: 'loss',
      rr: '',
      map: 'Bind',
      mode: 'unrated',
      modeLabel: 'Unrated',
      time: '9h ago',
      agent: 'O',
      agentName: 'Omen',
      score: '10 : 13',
      outcome: 'Defeat',
      acs: '216',
      kda: '17/19/4'
    },

    {
      result: 'win',
      rr: '',
      map: 'Sunset',
      mode: 'premier',
      modeLabel: 'Premier',
      time: '1d ago',
      agent: 'C',
      agentName: 'Cypher',
      score: '13 : 8',
      outcome: 'Victory',
      acs: '231',
      kda: '18/11/9'
    },

    {
      result: 'win',
      rr: '',
      map: 'Lotus',
      mode: 'spike-rush',
      modeLabel: 'Spike Rush',
      time: '1d ago',
      agent: 'R',
      agentName: 'Raze',
      score: '4 : 2',
      outcome: 'Victory',
      acs: '265',
      kda: '11/6/3'
    },

    {
      result: 'loss',
      rr: '',
      map: 'Kasbah',
      mode: 'deathmatch',
      modeLabel: 'Deathmatch',
      time: '2d ago',
      agent: 'E',
      agentName: 'Every Agent',
      score: '36 / 40',
      outcome: '4th',
      acs: '—',
      kda: '36/—/—'
    },

    {
      result: 'win',
      rr: '',
      map: 'Piazza',
      mode: 'team-deathmatch',
      modeLabel: 'Team Deathmatch',
      time: '2d ago',
      agent: 'V',
      agentName: 'Various',
      score: '100 : 86',
      outcome: 'Victory',
      acs: '—',
      kda: '21/14/6'
    },

    {
      result: 'win',
      rr: '',
      map: 'District',
      mode: 'escalation',
      modeLabel: 'Escalation',
      time: '3d ago',
      agent: 'V',
      agentName: 'Various',
      score: '12 : 8',
      outcome: 'Victory',
      acs: '—',
      kda: '—'
    },

    {
      result: 'win',
      rr: '',
      map: 'Ascent',
      mode: 'retake',
      modeLabel: 'Retake',
      time: '4d ago',
      agent: 'S',
      agentName: 'Sage',
      score: '5 : 3',
      outcome: 'Victory',
      acs: '221',
      kda: '12/8/4'
    },

    {
      result: 'loss',
      rr: '',
      map: 'Skirmish',
      mode: 'skirmish',
      modeLabel: 'Skirmish',
      time: '5d ago',
      agent: 'F',
      agentName: 'Fade',
      score: '4 : 5',
      outcome: 'Defeat',
      acs: '—',
      kda: '9/11/2'
    },

    {
      result: 'win',
      rr: '',
      map: 'Glitch',
      mode: 'gauntlet-glitch',
      modeLabel: 'Gauntlet: Glitch',
      time: '6d ago',
      agent: 'V',
      agentName: 'Various',
      score: '5 : 2',
      outcome: 'Victory',
      acs: '—',
      kda: '—'
    },

    {
      result: 'win',
      rr: '',
      map: 'Ascent',
      mode: 'custom',
      modeLabel: 'Custom',
      time: '7d ago',
      agent: 'Y',
      agentName: 'Yoru',
      score: '13 : 10',
      outcome: 'Victory',
      acs: '251',
      kda: '22/15/5'
    }

  ];


  /* =====================================================
     MATCH FILTER UI
     ===================================================== */

  const filterContainer =
    app.querySelector('#match-filters');

  const matchList =
    app.querySelector('#match-list');

  const matchCount =
    app.querySelector('#match-count');


  let activeMode = 'all';


  function createFilterButtons() {

    filterContainer.innerHTML = '';


    GAME_MODES.forEach((mode) => {

      const button =
        document.createElement('button');

      button.type = 'button';

      button.className =
        'match-filter';

      if (mode.id === activeMode) {
        button.classList.add(
          'is-active'
        );
      }

      button.dataset.mode =
        mode.id;

      button.textContent =
        mode.label;


      button.addEventListener(
        'click',
        () => {

          activeMode =
            mode.id;

          createFilterButtons();

          renderMatches();
        }
      );


      filterContainer.appendChild(
        button
      );
    });
  }


  /* =====================================================
     MATCH RENDERING
     ===================================================== */

  function renderMatches() {

    let visibleMatches;

    if (activeMode === 'all') {

      visibleMatches =
        MATCHES;

    } else {

      visibleMatches =
        MATCHES.filter(
          (match) =>
            match.mode === activeMode
        );
    }


    matchList.innerHTML = '';


    if (visibleMatches.length === 0) {

      matchList.innerHTML = `
        <div class="match-empty">
          <strong>No matches found</strong>
          <span>
            There are no recorded matches for this mode yet.
          </span>
        </div>
      `;

      matchCount.textContent =
        'No matches';

      return;
    }


    const modeName =
      activeMode === 'all'
        ? 'All modes'
        : GAME_MODES.find(
            (mode) =>
              mode.id === activeMode
          )?.label || 'Matches';


    matchCount.textContent =
      `${modeName} · ${visibleMatches.length} matches`;


    visibleMatches.forEach(
      (match) => {

        const article =
          document.createElement('article');

        article.className =
          `match-card ${match.result}`;


        const resultLetter =
          match.result === 'win'
            ? 'W'
            : 'L';


        article.innerHTML = `

          <div class="match-result">

            <strong>
              ${resultLetter}
            </strong>

            <span>
              ${match.rr || '—'}
            </span>

          </div>


          <div class="match-map">

            <strong>
              ${match.map}
            </strong>

            <span>
              ${match.modeLabel}
              ·
              ${match.time}
            </span>

            <span class="match-mode">
              ${match.modeLabel}
            </span>

          </div>


          <div class="match-agent">

            <span class="agent-symbol">
              ${match.agent}
            </span>

            <span>
              ${match.agentName}
            </span>

          </div>


          <div class="match-score">

            <strong>
              ${match.score}
            </strong>

            <span>
              ${match.outcome}
            </span>

          </div>


          <div class="match-stats">

            <strong>
              ACS ${match.acs}
            </strong>

            <span>
              K/D/A ${match.kda}
            </span>

          </div>

        `;


        matchList.appendChild(
          article
        );
      }
    );
  }


  /* =====================================================
     INITIALIZE
     ===================================================== */

  activateTab('matches');

  createFilterButtons();

  renderMatches();

})();