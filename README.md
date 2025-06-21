# Pogonka

## Development with Auto-Reload

This project is set up with auto-reload functionality for both server-side code and CSS styles.

### Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server with auto-reload:
   ```
   npm run dev:watch
   ```

### What's Included

The development setup includes:

- **Auto-reload for server**: When you change TypeScript files or Handlebars templates, the server will automatically restart.
- **Auto-regeneration of CSS**: When you add or modify Tailwind CSS classes in your templates, the CSS will be automatically regenerated.

### Available Scripts

- `npm run build` - Compile TypeScript files
- `npm run tailwind:css` - Generate CSS from Tailwind
- `npm run start` - Start the production server
- `npm run dev` - Build and start the server (without watching)
- `npm run dev:watch` - Start development mode with auto-reload (recommended for development)

### How It Works

The auto-reload functionality is powered by:

- **nodemon**: Watches for changes in compiled JavaScript files and Handlebars templates
- **tsc --watch**: Watches for changes in TypeScript files and recompiles them
- **postcss --watch**: Watches for changes in Tailwind CSS usage and regenerates the CSS
- **concurrently**: Runs all the watch processes simultaneously

When you add a new Tailwind CSS class to your templates or modify existing ones, the CSS will be automatically regenerated. Similarly, when you change server code or templates, the server will automatically restart.