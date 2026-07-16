// ==UserScript==
// @name         Medium to ReadMedium Redirector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically redirects all medium.com pages to readmedium.com
// @author       Leonidas
// @match        *://*.medium.com/*
// @match        *://medium.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get the current full URL
    var currentUrl = window.location.href;

    // Build the redirect target
    // Example: https://medium.com/@username/article-title
    // becomes: https://readmedium.com/https://medium.com/@username/article-title
    var redirectUrl = 'https://readmedium.com/' + currentUrl;

    // Perform the redirect
    window.location.replace(redirectUrl);
})();
