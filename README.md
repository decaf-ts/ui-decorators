![Banner](./workdocs/assets/Banner.png)

## User Interface Decorators

Introduces a declarative way to render UI forms



![Licence](https://img.shields.io/github/license/decaf-ts/ui-decorators.svg?style=plastic)
![GitHub language count](https://img.shields.io/github/languages/count/decaf-ts/ui-decorators?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/decaf-ts/ui-decorators?style=plastic)

[![Build & Test](https://github.com/decaf-ts/ui-decorators/actions/workflows/nodejs-build-prod.yaml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/nodejs-build-prod.yaml)
[![CodeQL](https://github.com/decaf-ts/ui-decorators/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/codeql-analysis.yml)[![Snyk Analysis](https://github.com/decaf-ts/ui-decorators/actions/workflows/snyk-analysis.yaml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/snyk-analysis.yaml)
[![Pages builder](https://github.com/decaf-ts/ui-decorators/actions/workflows/pages.yaml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/pages.yaml)
[![.github/workflows/release-on-tag.yaml](https://github.com/decaf-ts/ui-decorators/actions/workflows/release-on-tag.yaml/badge.svg?event=release)](https://github.com/decaf-ts/ui-decorators/actions/workflows/release-on-tag.yaml)

![Open Issues](https://img.shields.io/github/issues/decaf-ts/ui-decorators.svg)
![Closed Issues](https://img.shields.io/github/issues-closed/decaf-ts/ui-decorators.svg)
![Pull Requests](https://img.shields.io/github/issues-pr-closed/decaf-ts/ui-decorators.svg)
![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

![Forks](https://img.shields.io/github/forks/decaf-ts/ui-decorators.svg)
![Stars](https://img.shields.io/github/stars/decaf-ts/ui-decorators.svg)
![Watchers](https://img.shields.io/github/watchers/decaf-ts/ui-decorators.svg)

![Node Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=Node&query=$.engines.node&colorB=blue)
![NPM Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=NPM&query=$.engines.npm&colorB=purple)

Documentation available [here](https://decaf-ts.github.io/ui-decorators/)

### Description

Extension of `db-decorators`, exposes a simple implementation to handle automatic model rendering:
- decorate classes and attributes as UI elements or UI element properties;
- provides the base objects to implement `RenderingEngine` specific to each tech (Ionic, Angular, React, HTML5, etc);
    - automatic CRUD view rendering;
    - automatic UI validation according to `decorator-validation`'s decorators;
    - enables automatic custom validation (not HTML standard);

Adds a new Decorator ```uimodel``` to add UI metadata to the model, that can be later interpreted by different rendering strategies
Adds a new Decorator ```uiprop``` to add UI metadata to the model's properties, that can later be converted into properties for the `uimodel`
Adds a new Decorator ```uielement``` to add UI metadata to the model's properties, that can later be converted into Graphical elements
Adds a new Decorator ```hideOn``` to add UI metadata to the model's properties, so heir visibility can be controlled depending on the CRUD operation


### How to Use

- [Initial Setup](../../workdocs/tutorials/For%20Developers.md#_initial-setup_)
- [Installation](../../workdocs/tutorials/For%20Developers.md#installation)




### Related

[![decaf-ts](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=decaf-ts)](https://github.com/decaf-ts/decaf-ts)
[![decorator-validation](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=decorator-validation)](https://github.com/decaf-ts/decorator-validation)
[![db-decorators](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=db-decorators)](https://github.com/decaf-ts/db-decorators)


### Social

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/decaf-ts/)




#### Languages

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ShellScript](https://img.shields.io/badge/Shell_Script-121011?style=for-the-badge&logo=gnu-bash&logoColor=white)

## Getting help

If you have bug reports, questions or suggestions please [create a new issue](https://github.com/decaf-ts/ts-workspace/issues/new/choose).

## Contributing

I am grateful for any contributions made to this project. Please read [this](./workdocs/98-Contributing.md) to get started.

## Supporting

The first and easiest way you can support it is by [Contributing](./workdocs/98-Contributing.md). Even just finding a typo in the documentation is important.

Financial support is always welcome and helps keep both me and the project alive and healthy.

So if you can, if this project in any way. either by learning something or simply by helping you save precious time, please consider donating.

## License

This project is released under the [MIT License](./LICENSE.md).

By developers, for developers...