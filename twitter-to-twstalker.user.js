// ==UserScript==
// @name         Twitter/X to twstalker Redirector
// @namespace    VHdpdHRlci9YIHRvIE5pdHRlciBSZWRpcmVjdG9y
// @version      1.3
// @description  Auto redirect Twitter/X links to twstalker, a privacy-focused viewer
// @author       Leonidas
// @license      GPLv3
// @icon         https://twstalker.com/favicon.ico
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // List of available twstalker instances (fallback if primary is down)
    const twstalker_INSTANCES = [
        'twstalker.com'
    ];

    const PRIMARY_twstalker = 'https://twstalker.com';

    // Helper to get working twstalker instance
    function gettwstalkerInstance() {
        return PRIMARY_twstalker;
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
        const twstalkerUrl = gettwstalkerInstance() + window.location.pathname + window.location.search;
        window.location.replace(twstalkerUrl);
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

            // Preserve username/status ID structure for twstalker
            const twstalkerUrl = gettwstalkerInstance() + url.pathname + url.search;
            window.__cpLocation = window.open(twstalkerUrl, link.target || '_self');
        } catch (err) {
            // Ignore invalid URLs silently
        }
    }, true); // Capture phase - intercepts before site scripts

    // --- 3. Hover Effect (UX Polish) ---
    window.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href]');
        if (!link || link.dataset.twstalkerRewritten) return;

        try {
            const url = new URL(link.href);

            // ✅ FIX: Use exact hostname match - no false positives for olx.com
            if (!isTwitterHostname(url.hostname)) return;

            const twstalkerUrl = gettwstalkerInstance() + url.pathname + url.search;
            link.href = twstalkerUrl;
            link.title = (link.title || 'Twitter link') + ' (Redirects to twstalker - privacy viewer)';
            link.dataset.twstalkerRewritten = 'true';
        } catch (err) {}
    }, { passive: true });

    // --- 4. Embed/Video Support ---
    // Convert Twitter embed URLs to twstalker embeds
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const links = node.querySelectorAll?.('a[href]') || [];

                    links.forEach(link => {
                        if (link.dataset.twstalkerRewritten) return;

                        try {
                            const url = new URL(link.href);

                            // ✅ FIX: Use exact hostname match - no false positives for olx.com
                            if (!isTwitterHostname(url.hostname)) return;

                            const twstalkerUrl = gettwstalkerInstance() + url.pathname + url.search;
                            link.href = twstalkerUrl;
                            link.dataset.twstalkerRewritten = 'true';
                        } catch (err) {}
                    });
                }
            });
        });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
