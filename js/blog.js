(function(global) {
    //#region [ Fields ]

    var doc = global.document;
    var mdc = global.mdc;

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
    });

    //#endregion    
})((function(){ return this; })());