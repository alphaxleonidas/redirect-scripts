// ==UserScript==
// @name         Twitter/X to Nitter Redirector
// @namespace    VHdpdHRlci9YIHRvIE5pdHRlciBSZWRpcmVjdG9y
// @version      1.3
// @description  Auto redirect Twitter/X links to Nitter, a privacy-focused viewer
// @updateURL    https://github.com/alphaxleonidas/redirect-scripts/raw/refs/heads/main/twitter-to-nitter.user.js
// @downloadURL  https://github.com/alphaxleonidas/redirect-scripts/raw/refs/heads/main/twitter-to-nitter.user.js
// @author       Leonidas
// @license      GPLv3
// @icon         https://nitter.net/favicon.ico
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // List of available nitter instances (fallback if primary is down)
    const NITTER_INSTANCES = [
        'nitter.net',
        'xcancel.com',
        'nitter.poast.org',
        'nitter.privacyredirect.com',
        'nitter.tiekoetter.com',
        'nitter.1d4.us'
    ];

    const PRIMARY_NITTER = 'https://nitter.net';

    // Helper to get working nitter instance
    function getNitterInstance() {
        return PRIMARY_NITTER;
    }

    // ✅ FIX: Helper to check if hostname is EXACTLY twitter.com or x.com
    // Prevents false positives like olx.com, conx.com, mx.com, bx.com
    function isTwitterHostname(hostname) {
        return hostname === 'twitter.com' ||
               hostname === 'x.com' ||
               hostname === 'mobile.twitter.com' ||
               hostname === 'api.twitter.com' ||
               hostname.endsWith('.twitter.com');
        // NOTE: Removed .x.com suffix check - no legitimate subdomains exist
    }

    // 1. Direct redirect if already on Twitter/X
    if (isTwitterHostname(window.location.hostname)) {
        const nitterUrl = getNitterInstance() + window.location.pathname + window.location.search;
        window.location.replace(nitterUrl);
        return;
    }

    // --- 2. High-Performance Link Interceptor ---
    window.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        try {
            const url = new URL(link.href);

            // ✅ FIX: Use exact hostname match - no false positives for olx.com
            if (!isTwitterHostname(url.hostname)) return;

            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

            // Preserve username/status ID structure for nitter
            const nitterUrl = getNitterInstance() + url.pathname + url.search;
            window.__cpLocation = window.open(nitterUrl, link.target || '_self');
        } catch (err) {
            // Ignore invalid URLs silently
        }
    }, true); // Capture phase - intercepts before site scripts

    // --- 3. Hover Effect (UX Polish) ---
    window.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href]');
        if (!link || link.dataset.nitterRewritten) return;

        try {
            const url = new URL(link.href);

            // ✅ FIX: Use exact hostname match - no false positives for olx.com
            if (!isTwitterHostname(url.hostname)) return;

            const nitterUrl = getNitterInstance() + url.pathname + url.search;
            link.href = nitterUrl;
            link.title = (link.title || 'Twitter link') + ' (Redirects to Nitter - privacy viewer)';
            link.dataset.nitterRewritten = 'true';
        } catch (err) {}
    }, { passive: true });

    // --- 4. Embed/Video Support ---
    // Convert Twitter embed URLs to nitter embeds
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const links = node.querySelectorAll?.('a[href]') || [];

                    links.forEach(link => {
                        if (link.dataset.nitterRewritten) return;

                        try {
                            const url = new URL(link.href);

                            // ✅ FIX: Use exact hostname match - no false positives for olx.com
                            if (!isTwitterHostname(url.hostname)) return;

                            const nitterUrl = getNitterInstance() + url.pathname + url.search;
                            link.href = nitterUrl;
                            link.dataset.nitterRewritten = 'true';
                        } catch (err) {}
                    });
                }
            });
        });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
