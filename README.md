# jetpack
npm module: code bundler for client-side js/html/css/img and deployment tool.

https://github.com/jerfletcher/hubTm will eventually move here as an npm package.

# hubTm
    Packager for browser js, css, html


## Goals
*   Brand and Team independent (distinct repos)
*   Ads (MPS) and DTM script replacement
*   Easy dev and test setup
*   Programmatically specify dependencies
*   Minify option
*   Release tracking (via Git releases)
*   Facilitate code reuse
*   Respect file extensions (.js, .css, .html)
*   Shared logic for display/launch rules
*   Nice to have: Introspection via browser console
*   Nice to have: Analytics
    
![alt text](https://docs.google.com/drawings/d/1Vv341Zr22ccehyCmahUQ7_kXvsVZk4JSXFoj44y45FM/pub?w=452&h=719 "Architecture")


## Installation

    git clone https://github.com/nbcnews/jetpack-project
    cd jetpack-project
    vagrant up --provision
    vagrant ssh
    cd /vagrant
    npm install

## Build a Bundle
    npm run bundle [project]
    npm run bundle:dev [project]

## Next Steps
*   ~~Incorporate actual Ad code~~
*   ~~add relative path imgs to dist~~
*   Lazy loading mechanism
*   automate deployment
*   Refactor display/launch rules (optionsManager)
*   ~~Create NPM component and split repo~~
*   Work with Ops on deployment process (Github release mechanism + server buildout + file copy + redirect)

## Run the server for local dev
TODO: open a new terminal window
	npm run server
browse to http://localhost:8888/

