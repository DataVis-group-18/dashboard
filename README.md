# Dashboard

## How to use:
First install dependencies with:
```
npm install
```

Then run the live reloading development server with:
```
npm run start
```

To build a static website:
```
npm run build
```

Deploying the site to GitHub Pages:
```
./deploy.sh
```

## Folder structure
```
dashboard
├── README.md         // this document
├── deploy.sh         // script to deploy to GitHub pages
│
├── package.json      // NPM package configuration
├── tsconfig.json     // TypeScript configuration
├── vite.config.js    // Vite configuration
│
├── public            // everything in public will be accessible on the page
│
├── index.html        // HTML entrypoint
├── src               // JS & CSS files
│  ├── main.ts
│  └── style.css
└── dist              // The output of `npm run build` will be put here
```