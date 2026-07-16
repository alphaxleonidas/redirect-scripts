// ==UserScript==
// @name         TikTok to Urlebird Redirector
// @namespace    TikTok to Urlebird Redirector
// @version      1.0
// @description  Auto redirect TikTok links to Urlebird, a privacy-focused TikTok viewer
// @author       Leonidas
// @license      GPLv3
// @icon         https://urlebird.com/favicon.ico
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Helper function to ensure URL has trailing slash
    function ensureTrailingSlash(url) {
        if (url.endsWith('/')) return url;
        if (url.includes('?') || url.includes('#')) return url;
        
        try {
            const urlObj = new URL(url);
            if (!urlObj.pathname.endsWith('/')) {
                urlObj.pathname = urlObj.pathname + '/';
                return urlObj.toString();
            }
        } catch (err) {
            if (!url.endsWith('/') && !url.includes('?') && !url.includes('#')) {
                return url + '/';
            }
        }
        return url;
    }

    // Function to convert TikTok URL to Urlebird URL
    function convertToUrlebirdUrl(tiktokUrl) {
        try {
            const url = new URL(tiktokUrl);
            
            // Skip if not a TikTok URL
            if (!url.hostname.includes('tiktok.com')) return null;
            
            let path = url.pathname;
            
            // Handle different TikTok URL patterns
            // Pattern 1: /@username
            if (path.match(/^\/@[\w.]+/)) {
                const username = path.match(/^\/@([\w.]+)/)[1];
                return ensureTrailingSlash(`https://urlebird.com/user/${username}`);
            }
            
            // Pattern 2: /@username/video/1234567890
            if (path.match(/^\/@[\w.]+\/video\/\d+/)) {
                const username = path.match(/^\/@([\w.]+)/)[1];
                const videoId = path.match(/\/video\/(\d+)/)[1];
                return `https://urlebird.com/video/${username}/${videoId}/`;
            }
            
            // Pattern 3: /@username/photo/1234567890
            if (path.match(/^\/@[\w.]+\/photo\/\d+/)) {
                const username = path.match(/^\/@([\w.]+)/)[1];
                const photoId = path.match(/\/photo\/(\d+)/)[1];
                return `https://urlebird.com/photo/${username}/${photoId}/`;
            }
            
            // Pattern 4: /t/xxxxx (short link)
            if (path.match(/^\/t\/[\w]+/)) {
                // For short links, we redirect to the main Urlebird page
                // Urlebird might not support short links directly
                return 'https://urlebird.com/';
            }
            
            // Default: Just go to user page if we can extract username
            if (path.includes('@')) {
                const username = path.match(/@([\w.]+)/)[1];
                if (username) {
                    return ensureTrailingSlash(`https://urlebird.com/user/${username}`);
                }
            }
            
            // Fallback to homepage
            return 'https://urlebird.com/';
            
        } catch (err) {
            return null;
        }
    }

    // Skip if already on Urlebird
    if (window.location.hostname === 'urlebird.com') return;

    // --- 1. Handle Direct Navigation to TikTok ---
    if (window.location.hostname.includes('tiktok.com')) {
        const urlebirdUrl = convertToUrlebirdUrl(window.location.href);
        if (urlebirdUrl) {
            window.location.replace(urlebirdUrl);
        }
        return;
    }

    // --- 2. Click Interceptor for TikTok Links ---
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="tiktok.com"]');
        if (!link) return;

        try {
            const url = new URL(link.href);
            if (url.hostname.includes('tiktok.com')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const urlebirdUrl = convertToUrlebirdUrl(link.href);
                if (urlebirdUrl) {
                    window.location.href = urlebirdUrl;
                }
            }
        } catch (err) {
            // Ignore invalid URLs
        }
    }, true);

    // --- 3. Hover Effect ---
    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href*="tiktok.com"]');
        if (!link || link.dataset.urlebirdRewritten) return;

        try {
            const url = new URL(link.href);
            if (url.hostname.includes('tiktok.com')) {
                const urlebirdUrl = convertToUrlebirdUrl(link.href);
                if (urlebirdUrl) {
                    link.href = urlebirdUrl;
                    link.title = (link.title || '') + ' (Redirects to Urlebird)';
                    link.dataset.urlebirdRewritten = 'true';
                }
            }
        } catch (err) {}
    }, { passive: true });

    // --- 4. Handle dynamically added links (MutationObserver) ---
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const links = node.querySelectorAll('a[href*="tiktok.com"]');
                    links.forEach(link => {
                        if (!link.dataset.urlebirdRewritten) {
                            try {
                                const url = new URL(link.href);
                                if (url.hostname.includes('tiktok.com')) {
                                    const urlebirdUrl = convertToUrlebirdUrl(link.href);
                                    if (urlebirdUrl) {
                                        link.href = urlebirdUrl;
                                        link.dataset.urlebirdRewritten = 'true';
                                    }
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
