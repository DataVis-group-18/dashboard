# Dashboard

## Online Dashboard

You can find the online dashboard [here](https://datavis-group-18.github.io/dashboard/).

## How to use
> Note: The data is not committed on the `main` branch. It should be placed in the `public/data` folder.

First install dependencies with:
```console
npm install
```

Then run the live reloading development server with:
```console
npm run start
```

To build a static website:
```console
npm run build
```

Deploying the site to GitHub Pages (includes uploading the data):
```console
./deploy.sh
```

This last command with build the site to `dist` and commit it to the `gh-pages` branch, which is hosted by GitHub Pages.

## Tech Stack
The following technologies/tools are used in this project:
- [D3](https://d3js.org/) (for visualization)
- [TypeScript](https://www.typescriptlang.org/) (for type checking)
- [Vite](https://vitejs.dev/) (for dependency building)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) (for hosting)

## Folder structure
```
dashboard
├── README.md         // This document
├── deploy.sh         // Script to deploy to GitHub pages
│
├── package.json      // NPM package configuration
├── tsconfig.json     // TypeScript configuration
├── vite.config.js    // Vite configuration
│
├── public            // Everything in public will be accessible on the page
│  └── data           // Data should be put here
│
├── index.html        // HTML entrypoint
├── src               // JS & CSS files
│  ├── main.ts        // TypeScript entrypoint
│  └── style.css
└── dist              // The output of `npm run build` will be put here
```

## Notes on using Vite
Vite is a bundling tool for JavaScript and TypeScript projects. It analyses all files that are used throughout the project and bundles them during the `npm run build` command. Therefore, Vite needs complete control over what is and what is not included into the final HTML.

In many tutorials, you will see that `D3` is included using a `<script>` in the HTML, but we can let Vite take care of that by installing via NPM and just referencing it in the code. This leads (hopefully) to better load times of the website, but also to cleaner code.

The same goes for CSS, we can import multiple CSS files in `main.ts`, which all get transformed into a single CSS files by Vite:
```ts
import './style.css';
```
This means that you don't have to manually add `<link>` tags into the HTML.





