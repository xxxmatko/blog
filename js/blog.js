(function(global) {
    //#region [ Fields ]

    var doc = global.document;
    var mdc = global.mdc;
    var ko = global.ko;
    var moment = global.moment;

    //#endregion


    //#region [ Constructors ]

    /**
     * Creates new instance of the Blog.
     */
    var Blog = function (args) {
        console.debug("Blog()");

        this.moment = args.moment;

        this.tocUrl = "https://api.github.com/repos/xxxmatko/blog/contents/docs/toc.json";
        this.toc = ko.observableArray([]);
    };

    //#endregion


    //#region [ Methods : Public ]

    /**
     * Loads the TOC content.
     */
    Blog.prototype.loadToc = function () {
        console.debug("Blog : loadToc()");

        return fetch(this.tocUrl, {
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
            return !response || !response.value ? [] : response.value;
        }).then(this.toc);
    };

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

    //#endregion


    //#region [ Start ]

    /**
     * Starts the web.
     */
    ready(function () {
        mdc.autoInit();
        moment.locale("sk");

        var blog = new Blog({
            moment: moment
        });
        ko.applyBindings(blog, doc.body);

        blog.loadToc();
    });

    //#endregion    
})((function(){ return this; })());