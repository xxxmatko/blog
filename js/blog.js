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

        this.global = args.global;
        this.moment = args.moment;

        this.route = ko.observable(args.route || "");
        this.article = ko.observable("");

        this.tocUrl = args.tocUrl;
        this.toc = ko.observableArray([]);

        this._routeChangedSubscribe = ko.computed(this._routeChanged, this);
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


    //#region [ Event Handlers ]

    /**
     * Handles hash change event.
     */
    Blog.prototype._onHashChanged = function(e) {
        this.route((this.global.location.hash || "").replace(/^#/gi,""));
    };


    /**
     * Handles route change event.
     */
    Blog.prototype._routeChanged = function () {
        var route = this.route();

        if(!route) {
            this.article("");
            return;
        }

        return fetch("https://api.github.com/repos/xxxmatko/blog/contents/docs/" + route + "/index.md", {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.html",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        }).then(function(response) {
            if(response.ok) {
                return response.text();
            }

            return null;
        }).then(function (response) {
            return !response ? "<h4 class='article__title article__title--center mdc-typography--headline4'>Stránka, ktorú hľadáte neexistuje</h4>" : response;
        }).then(this.article).then(function() {
            setTimeout(function() {
                doc.querySelector("article").scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            }, 100);
        });
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

        var blog = global.blog = new Blog({
            global: global,
            moment: moment,
            route: (global.location.hash || "").replace(/^#/gi,""),
            tocUrl: "https://api.github.com/repos/xxxmatko/blog/contents/docs/toc.json"
        });
        ko.applyBindings(blog, doc.body);

        blog.loadToc();

        // Handle events
        global.addEventListener("hashchange", blog._onHashChanged.bind(blog),false);
    });

    //#endregion    
})((function(){ return this; })());