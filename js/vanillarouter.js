import Events from "./events.js";

const ROUTER_TYPES = {
    hash: "hash", history: "history"
}, defer = x => { setTimeout(() => x(), 10); }

/**
 * SPA Router - replacement for Framework Routers (history and hash).
*/
class VanillaRouter {
    constructor(options = {}) {
        this.events = new Events(this);
        this.options = { type: ROUTER_TYPES.hash, ...options };
    }

    /**
     * Start listening for route changes.
     * @returns {VanillaRouter} reference to itself.
     */
    listen() {
        this.routeHash = Object.keys(this.options.routes);

        if (!this.routeHash.includes("/"))
            throw TypeError("No home route found");

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
            window.addEventListener("popstate", this._triggerPopState.bind(this));

            defer(() => this._tryNav(href));
        }
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
            route: this.options.routes[path], path: path, url: url
        })
    }

    _findRoute(url) {
        var test = "/" + url.match(/([A-Za-z_0-9.]*)/gm, (match, token) => { return token })[1];
        return this.routeHash.includes(test) ? test : null;
    }

    _tryNav(href) {
        const url = this._createUrl(href);
        if (url.protocol.startsWith("http")) {
            const routePath = this._findRoute(url.pathname);
            if (routePath && this.options.routes[routePath]) {
                if (this.options.type === "history") {
                    window.history.pushState({ path: routePath }, routePath, url.origin + url.pathname);
                }
                this._triggerRouteChange(routePath, url);
                return true;
            }
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
        if (href && this._tryNav(href))
            e.preventDefault();
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