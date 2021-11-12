import Events from "./events.js";

const ROUTER_TYPES = {
    hash: "hash", history: "history"
}
/**
 * SPA Router - replacement for Framework Routers (history and hash).
*/
class VanillaRouter {
    constructor(options = {}) {
        this.events = new Events(this);
        this.options = {
            type: ROUTER_TYPES.hash,
            ...options
        }
    }

    /**
     * Start listening for route changes.
     * @returns {VanillaRouter} reference to itself.
     */
    listen() {
        // sort descending by key length
        this.routeHash = Object.keys(this.options.routes).sort((a, b) => {
            if (a.length < b.length)
                return 1;
            if (a.length > b.length)
                return -1
            return 0;
        }).map(i => {
            if (!i.startsWith("/"))
                throw TypeError("Malformed route")
            return i
        })

        if (this.routeHash.length === 0)
            throw TypeError("No routes defined")

        if (this.routeHash.at(-1) !== "/")
            throw TypeError("No home route found");


        const defer = x => { setTimeout(() => x(), 10); }

        if (this.isHashRouter) {
            window.addEventListener('hashchange', this._hashChanged.bind(this));
            defer(() => this._tryNav(document.location.hash.substr(1)));
        }
        else {
            let href = document.location.origin;
            if (this._findRoute(document.location.pathname)) {
                href += document.location.pathname;
            }
            document.addEventListener("click", this._onNavClick.bind(this));
            window.onpopstate = this._triggerPopState.bind(this)
            defer(() => this._tryNav(href));
        }
        console.log(`Listening (${this.options.type})...`);

        return this;
    }

    _hashChanged() {
        this._tryNav(document.location.hash.substr(1))
    }

    _triggerPopState(e) {
        this._triggerRouteChange(e.state.path, e.target.location.href);
    }

    _triggerRouteChange(path, url) {
        this.events.trigger("route", {
            route: this.options.routes[path],
            path: path,
            url: url
        })
    }

    _findRoute(url) { // routeHash is sorted on string length, descending
        let key = null;
        for (key of this.routeHash) {
            if (url.startsWith(key)) break;
        }
        if (key === "/" && url.split("?")[0].length > 1) {
            return null;
        }
        return key;
    }

    _tryNav(href) {
        const url = this._createUrl(href),
            routePath = this._findRoute(url.pathname);

        if (routePath && this.options.routes[routePath]) {
            if (this.options.type === "history") {
                window.history.pushState({ path: routePath }, routePath, url.origin + url.pathname);
            }
            this._triggerRouteChange(routePath, url);
            return true;
        }
    }

    _createUrl(href) {
        if (this.isHashRouter && href.startsWith("#")) {
            href = href.substr(1);
        }
        return new URL(href, document.location.origin)
    }

    _onNavClick(e) { // handle click in document
        const href = e.target?.closest("[href]")?.href;
        if (href) {
            if (this._tryNav(href))
                e.preventDefault();
        }
    };

    /**
     * Makes the router navigate to the given route
     * @param {String} path 
     */
    setRoute(path) {
        if (!this._findRoute(path))
            throw TypeError("Invalid route");

        let href = this.isHashRouter ? '#' + path : document.location.origin + path;
        history.replaceState(null, null, href);
        this._tryNav(href);
    }

    get isHashRouter() {
        return this.options.type === ROUTER_TYPES.hash;
    }
}

export default VanillaRouter;