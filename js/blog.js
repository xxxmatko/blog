(function(global) {
    //#region [ Fields ]

    var doc = global.document;
    var mdc = global.mdc;
    var toc = [];

    //#endregion


    //#region [ Methods ]

    /**
     * Fires function when DOM is ready.
     *
     * @param {function} fn Function.
     */
    function ready(fn) {
        if (doc.attachEvent ? (doc.readyState === "complete") : (doc.readyState !== "loading")) {
            fn();
        }
        else {
            doc.addEventListener("DOMContentLoaded", fn);
        }
    };


    /**
     * Loads toc content.
     */
    function loadToc() {
        return fetch("https://api.github.com/repos/xxxmatko/blog/contents/docs/toc.json", {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.raw",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            }

            return null;
        }).then(function (response) {
            if(!response) {
                return;
            }

            toc = response.value;
        });
    };

    //#endregion


    //#region [ Start ]

    /**
     * Starts the web.
     */
    ready(function () {
        mdc.autoInit();

        loadToc().then(function() {
            toc.forEach(function(article) {
                console.warn(article);
            });
        });        
    });

    //#endregion    
})((function(){ return this; })());