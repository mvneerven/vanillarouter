# Vanillarouter

One of the first reasons people select a JavaScript framework for SPAs/PWAs is the fact that JavaScript doesn't have a built-in router.

JavaScript does however include all it takes to create an efficient and easy to use routing mechanism. 

This one is pure, Vanilla ES6. A fully functional *hash* and *history* router for any SPA/PWA.

## Features

- History-based routing (```pushState```/```popState```)
- Hash-based routing (```hashchange```)
- Native JS Events
- Complete decoupling of any component architecture: you decide what to do with the ```route``` event
- Extremely tiny footprint.

## Installation

None

## Demo

See a working [demo](https://vanillaroute.z6.web.core.windows.net/), hosted as a Serverless Static Website on Azure Blob Storage. 

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