// ==UserScript==
// @name         Twitch Mobile/Desktop Switcher
// @namespace    https://github.com/twitch-switcher
// @version      1.6.0
// @description  Top-anchored switcher buttons. V = switch, H = hide/show, T = theatre, C = chat.
// @author       Leonidas
// @match        *://twitch.tv/*
// @match        *://www.twitch.tv/*
// @match        *://m.twitch.tv/*
// @icon         https://www.twitch.tv/favicon.ico
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/alphaxleonidas/redirect-scripts/raw/refs/heads/main/twitch-mobile-switcher.user.js
// @downloadURL  https://github.com/alphaxleonidas/redirect-scripts/raw/refs/heads/main/twitch-mobile-switcher.user.js
// ==/UserScript==

(function () {
  'use strict';

  /* ─── Constants ─────────────────────────────────────────────── */
  const PURPLE      = '#9146FF';
  const PURPLE_DARK = '#6B34C8';
  const TEXT        = '#EFEFF1';
  const Z           = '2147483647';

  const hostname = window.location.hostname;
  const isMobile = hostname === 'm.twitch.tv';
  // Path read at call-time so SPA navigations (e.g. twitch.tv → twitch.tv/channel) are caught.
  function currentPath() {
    return window.location.pathname + window.location.search + window.location.hash;
  }
  function toMobile()  { window.location.href = 'https://m.twitch.tv'   + currentPath(); }
  function toDesktop() { window.location.href = 'https://www.twitch.tv' + currentPath(); }
  const switchFn = isMobile ? toDesktop : toMobile;

  /* ─── Theatre mode toggle (desktop only) ────────────────────
     Tries the official data-a-target first, then falls back to
     aria-label substring match to handle locale differences
     ("Theatre" vs "Theater").                                  */
  function toggleTheatre() {
    const btn =
      document.querySelector('[data-a-target="theatre-mode-button"]') ||
      document.querySelector('button[aria-label*="heatre"]');
    if (btn) btn.click();
  }

  /* ─── Chat toggle ─────────────────────────────────────────────
     Clicks the collapse/expand chevron on the chat panel.
     Tries data-a-target attrs first (most stable), then explicit
     aria-label values for both collapsed and expanded states.   */
  function toggleChat() {
    const btn =
      document.querySelector('[data-a-target="chat-collapse-chevron"]')               ||
      document.querySelector('[data-a-target="right-column-chat-bar-collapsed-arrow"]') ||
      document.querySelector('button[aria-label="Collapse Chat"]')                    ||
      document.querySelector('button[aria-label="Expand Chat"]')                      ||
      document.querySelector('button[aria-label="Hide Chat"]')                        ||
      document.querySelector('button[aria-label="Show Chat"]');
    if (btn) btn.click();
  }

  /* ─── Keyboard shortcuts ─────────────────────────────────────
     V  →  instant switch (works even when button is hidden)
     H  →  toggle button visibility
     T  →  toggle theatre mode (desktop only)
     C  →  collapse / expand chat
     All skipped when typing in chat / any input field.        */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag    = e.target.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA'
                   || tag === 'SELECT' || e.target.isContentEditable;
    if (typing) return;
    if (e.key === 'v' || e.key === 'V') switchFn();
    if (e.key === 'h' || e.key === 'H') toggle();
    if (e.key === 't' || e.key === 'T') { if (!isMobile) toggleTheatre(); }
    if (e.key === 'c' || e.key === 'C') toggleChat();
  });

  /* ─── Per-side config ────────────────────────────────────────
     Desktop "Go Vertical":
       top 160px  →  just below typical pinned-message area
       (nav bar ~50px + chat header ~44px + pinned msg ~66px)

     Mobile "Go Horizontal":
       top 62px   →  just below the top-bar that holds
       settings / notifications / whispers (~56px tall)       */
  const LABEL   = isMobile ? 'Go Horizontal'  : 'Go Vertical';
  const ID      = isMobile ? 'tms-h'          : 'tms-v';
  const STORE   = isMobile ? 'tms_hidden_h'   : 'tms_hidden_v';
  const TOP     = isMobile ? '62px'           : '160px';
  const FONT    = isMobile ? '13px'           : '11px';
  const PAD     = isMobile ? '8px 13px'       : '6px 10px';
  const SZ      = isMobile ? '14'             : '12';

  const ICON_MONITOR = `
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8"  y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>`;
  const ICON_PHONE = `
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>`;
  const ICON = isMobile ? ICON_MONITOR : ICON_PHONE;

  function svg(size, paths) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  const isHidden = localStorage.getItem(STORE) === '1';

  /* ─── Styles ─────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Main pill ── */
    #${ID}-wrap {
      position: fixed;
      top: ${TOP};
      right: 0;
      z-index: ${Z};
      display: flex;
      align-items: stretch;
      border-radius: 6px 0 0 6px;
      overflow: hidden;
      box-shadow: -3px 3px 14px rgba(0,0,0,0.45);
      pointer-events: auto;
    }
    #${ID}-wrap.tms-gone { display: none !important; }

    #${ID}-main {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: ${PAD};
      background: ${PURPLE};
      color: ${TEXT};
      font-family: 'Roobert', 'Inter', system-ui, sans-serif;
      font-size: ${FONT};
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background 0.14s;
      user-select: none;
      white-space: nowrap;
      letter-spacing: 0.01em;
    }
    #${ID}-main:hover  { background: #7c3bdb; }
    #${ID}-main:active { background: ${PURPLE_DARK}; }

    /* V key badge inside the main button */
    #${ID}-main .tms-kbd {
      font-size: 9px;
      font-weight: 700;
      opacity: 0.65;
      background: rgba(0,0,0,0.25);
      border-radius: 3px;
      padding: 1px 4px;
      letter-spacing: 0.05em;
      margin-left: 2px;
    }

    /* Divider + × close */
    #${ID}-close {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      background: ${PURPLE_DARK};
      color: ${TEXT};
      font-size: 15px;
      line-height: 1;
      border: none;
      border-left: 1px solid rgba(255,255,255,0.12);
      cursor: pointer;
      transition: background 0.14s;
      user-select: none;
    }
    #${ID}-close:hover  { background: #5a29a8; }
    #${ID}-close:active { background: #4a2090; }

    /* ── Mini restore tab (shows when pill is hidden) ── */
    #${ID}-tab {
      position: fixed;
      top: ${TOP};
      right: 0;
      z-index: ${Z};
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 24px;
      background: ${PURPLE};
      color: ${TEXT};
      border: none;
      border-radius: 5px 0 0 5px;
      cursor: pointer;
      box-shadow: -2px 2px 8px rgba(0,0,0,0.4);
      transition: width 0.15s ease, background 0.14s;
      user-select: none;
      overflow: hidden;
    }
    #${ID}-tab:hover  { width: 22px; background: ${PURPLE_DARK}; }
    #${ID}-tab.tms-gone { display: none !important; }
  `;
  document.head.appendChild(style);

  /* ─── Build pill ─────────────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.id = `${ID}-wrap`;
  if (isHidden) wrap.classList.add('tms-gone');

  const mainBtn = document.createElement('button');
  mainBtn.id    = `${ID}-main`;
  mainBtn.title = `${LABEL} — V to switch instantly · H to hide`;
  mainBtn.innerHTML =
    svg(SZ, ICON) +
    ` ${LABEL} <span class="tms-kbd">V</span>`;
  mainBtn.addEventListener('click', switchFn);

  const closeBtn = document.createElement('button');
  closeBtn.id    = `${ID}-close`;
  closeBtn.title = 'Hide  (press H or click the edge tab to restore)';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', hide);

  wrap.appendChild(mainBtn);
  wrap.appendChild(closeBtn);

  /* ─── Build mini restore tab ─────────────────────────────────── */
  const tab = document.createElement('button');
  tab.id    = `${ID}-tab`;
  tab.title = 'Show switcher  (or press H)';
  tab.innerHTML = svg('9', ICON);
  if (!isHidden) tab.classList.add('tms-gone');
  tab.addEventListener('click', show);

  /* ─── Show / Hide / Toggle ───────────────────────────────────── */
  function hide() {
    wrap.classList.add('tms-gone');
    tab.classList.remove('tms-gone');
    localStorage.setItem(STORE, '1');
  }
  function show() {
    wrap.classList.remove('tms-gone');
    tab.classList.add('tms-gone');
    localStorage.removeItem(STORE);
  }
  function toggle() {
    wrap.classList.contains('tms-gone') ? show() : hide();
  }

  /* ─── Mount ──────────────────────────────────────────────────── */
  document.body.appendChild(wrap);
  document.body.appendChild(tab);

})();
