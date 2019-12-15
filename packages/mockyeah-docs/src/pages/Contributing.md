---
title: Contributing
---

# Contributing

**Installing project and dependencies:**

mockyeah was built and tested with Node v8+. Installing mockyeah:

```shell
# download project
$ git clone git@github.com:mockyeah/mockyeah.git
$ cd mockyeah

# install proper Node version
$ nvm install v8.16.0
$ nvm use

# install dependencies and link monorepo modules
npm install
npm start

# if tests pass, you're good to go
$ npm test
```

Open the [docs site at http://127.0.0.1:8000](http://127.0.0.1:8000).

## Troubleshooting

Mockyeah is a monorepo project, the dev tool `lerna` is required to connect the sub-modules in the `./packages` directory. If `lerna` doesn't run when you install the dependencies you can run it manually.

```sh
npx lerna bootstrap

# continue to run, build, and test
npm start
npm test
```
