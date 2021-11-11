# Vanillarouter

A fully functional *hash* and *history* router for use in Vanilla JavaScript SPAs.

## Installation

None

## Usage

```js
const router = new VanillaRouter({
    type: "history",
    routes: {
        "/": "home",
        "/about": "about",
        "/products": "products"
    }
}).listen().on("route", e => {
    
    // console.log(e.detail.route, e.detail.url);

})
```