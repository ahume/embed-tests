define(function() {

    var iframeCount = 0;

    function done(id) {
    	console.log("resize:", id)
        resizeIframe(id);
        var timer = setInterval(function() {
            resizeIframe(id);
        }, 1000);
        setTimeout(function() {
            clearInterval(timer);
        }, (5000));
    }

    function embedIsTooLarge(iframe) {
        var embedWidth = iframe.getAttribute('data-embed-width');
        if (embedWidth && embedWidth > window.innerWidth) {
            return true;
        }
        return false;
    }

    function replaceElement(elToRemove, elToInsert) {
        if (elToRemove.nextSibling) {
            elToRemove.parentNode.insertBefore(elToInsert, elToRemove.nextSibling);
        } else {
            elToRemove.parentNode.appendChild(elToInsert);
        }
        elToRemove.parentNode.removeChild(elToRemove);
    }

    function enhance() {
        /*jshint loopfunc: true */
        // Get all embed iframes that have not been fully rendered yet.
        var embeds = document.querySelectorAll('iframe.api-embed:not(.api-embed-polyfilled)');

        for (var i = 0, j = embeds.length; i<j; ++i) {
            var iframe = embeds[i];

            if (embedIsTooLarge(iframe)) {
                var p = document.createElement('p');
                var message = "embed is too large";
                var embedURL = iframe.getAttribute('data-embed-url');
                if (embedURL) {
                    message = "<a href='" + embedURL + "'>View embedded content</a>";
                }
                p.innerHTML = message;
                replaceElement(iframe, p);
                continue;
            }

            iframe.id = 'embed-iframe-' + (++iframeCount);
            iframe.style.height = 0;
            iframe.frameBorder = 0;
            iframe.style.border = 'none';
            iframe.width = '100%';

            var supportsSrcdoc = !!iframe.srcdoc;
            if (supportsSrcdoc) {
                if (iframe.contentWindow.document.readyState === 'complete') {
                    done(iframe.id);
                } else {
                    iframe.addEventListener('load', function() {
                        var iframe = this;
                        done(iframe.id);
                    }, false);
                }

            // If there's no srcdoc support write the src directly into the iframe.
            } else {
                var src = iframe.getAttribute('srcdoc');
                if (src && typeof src === 'string') {

                    iframe.contentWindow.contents = src;
                    iframe.src = 'javascript:window["contents"]';

                    done(iframe.id);
                }
            }

            iframe.className = iframe.className + ' api-embed-polyfilled';
        }
    }
 
    function resizeIframe(id) {
        var iframe = document.getElementById(id);
        if (iframe) {
            var b = iframe.contentWindow.document.body;
            b.style.padding = 0;
            b.style.margin = 0;
            var height = iframe.contentWindow.document.height || iframe.contentWindow.document.body.offsetHeight;
            iframe.style.height = height + 'px';
        }
    }

    window.GuardianEmbedDone = done;

    return {
        enhance: enhance
    };

});