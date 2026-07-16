// ==UserScript==
// @name         Instagram to Imginn Redirector
// @namespace    SW5zdGFncmFtIHRvIEltZ2lubiBSZWRpcmVjdG9y
// @version      1.3
// @description  Auto redirect Instagram links to Imginn, a privacy-focused viewer
// @author       Leonidas
// @license      GPLv3
// @icon         https://i25.servimg.com/u/f25/11/94/21/24/imginn10.png
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Helper function to ensure URL has trailing slash
    function ensureTrailingSlash(url) {
        // Don't add slash if URL already ends with slash, has query params, or has hash
        if (url.endsWith('/')) return url;
        if (url.includes('?') || url.includes('#')) return url;

        // Parse the URL to ensure we're only affecting the pathname
        try {
            const urlObj = new URL(url);
            if (!urlObj.pathname.endsWith('/')) {
                urlObj.pathname = urlObj.pathname + '/';
                return urlObj.toString();
            }
        } catch (err) {
            // If URL parsing fails, just add slash if not present
            if (!url.endsWith('/') && !url.includes('?') && !url.includes('#')) {
                return url + '/';
            }
        }
        return url;
    }

    // Skip if already on Imginn
    if (window.location.hostname === 'imginn.com') return;

    // --- 1. Handle Direct Navigation to Instagram ---
    if (window.location.hostname.includes('instagram.com')) {
        let newPath = 'https://imginn.com' + window.location.pathname;
        newPath = ensureTrailingSlash(newPath);
        window.location.replace(newPath);
        return;
    }

    // --- 2. Click Interceptor for Instagram Links ---
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="instagram.com"]');
        if (!link) return;

        try {
            const url = new URL(link.href);
            if (url.hostname.includes('instagram.com')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                let newUrl = 'https://imginn.com' + url.pathname;
                newUrl = ensureTrailingSlash(newUrl);
                window.location.href = newUrl;
            }
        } catch (err) {
            // Ignore invalid URLs
        }
    }, true);

    // --- 3. Hover Effect (Optional) ---
    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href*="instagram.com"]');
        if (!link || link.dataset.imginnRewritten) return;

        try {
            const url = new URL(link.href);
            if (url.hostname.includes('instagram.com')) {
                let newUrl = 'https://imginn.com' + url.pathname;
                newUrl = ensureTrailingSlash(newUrl);
                link.href = newUrl;
                link.title = (link.title || '') + ' (Redirects to Imginn)';
                link.dataset.imginnRewritten = 'true';
            }
        } catch (err) {}
    }, { passive: true });

    // --- 4. Handle dynamically added links (MutationObserver) ---
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const links = node.querySelectorAll('a[href*="instagram.com"]');
                    links.forEach(link => {
                        if (!link.dataset.imginnRewritten) {
                            try {
                                const url = new URL(link.href);
                                if (url.hostname.includes('instagram.com')) {
                                    let newUrl = 'https://imginn.com' + url.pathname;
                                    newUrl = ensureTrailingSlash(newUrl);
                                    link.href = newUrl;
                                    link.dataset.imginnRewritten = 'true';
                                }
                            } catch (err) {}
                        }
                    });
                }
            });
        });
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

})();
