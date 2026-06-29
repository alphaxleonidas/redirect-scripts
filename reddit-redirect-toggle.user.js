// ==UserScript==
// @name         Redirect to Redlib (Button)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Adds a floating button on Reddit to immediately redirect to Redlib.
// @author       Leonidas
// @match        *://*.reddit.com/*
// @match        *://reddit.com/*
// @match        *://*.redd.it/*
// @match        *://redd.it/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const REDLIB_INSTANCE = 'redlib.catsarch.com';   // change to your favourite

    // --- Don't inject on login, register, or signup pages ---
    const path = window.location.pathname;
    if (path.includes('/login') || path.includes('/register') || path.includes('/signup')) {
        return; // exit early – no button on these pages
    }

    function injectButton() {
        // Avoid duplicates
        if (document.getElementById('redlib-redirect-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'redlib-redirect-btn';
        btn.textContent = '🚀 Redirect to Redlib';
        btn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 20%;
            z-index: 9999;
            background: #ff4500;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 18px;
            font-size: 14px;
            font-family: sans-serif;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.6);
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1.4;
            gap: 6px;
            white-space: nowrap;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#e03d00';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = '#ff4500';
        });

        btn.addEventListener('click', function() {
            const currentUrl = window.location.href;
            let newUrl = currentUrl
                .replace(/^(https?:\/\/)([^\/]+\.)?reddit\.com/, `$1${REDLIB_INSTANCE}`)
                .replace(/^(https?:\/\/)redd\.it/, `$1${REDLIB_INSTANCE}`);
            if (newUrl !== currentUrl) {
                window.location.replace(newUrl);
            } else {
                alert('Already on a Redlib instance or the URL couldn’t be transformed.');
            }
        });

        document.body.appendChild(btn);
    }

    // Inject after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectButton);
    } else {
        injectButton();
    }
})();
