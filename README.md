# ArtE Collections

A React TypeScript application for browsing and curating art collections from multiple museum APIs. Users can explore artworks from the Rijksmuseum and Harvard Art Museums, create personal exhibitions, and organize their favorite pieces.

## Features

- Browse artworks from multiple museum APIs
- Search and filter artwork collections
- View detailed information about each artwork
- Create personal exhibitions/collections 
- Add/remove artworks to/from exhibitions
- Responsive design for all devices

## Project Structure

- `src/api` - API services and data fetching logic
- `src/types` - TypeScript type definitions
- `src/store` - Redux state management
- `src/pages` - Page components
- `src/components` - Reusable UI components
- `src/router` - Routing configuration with route guards
- `src/theme` - Material UI theme customization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_RIJKSMUSEUM_API_KEY=your_rijksmuseum_api_key
REACT_APP_HARVARD_API_KEY=your_harvard_api_key
```

You can obtain API keys from:
- Rijksmuseum API: https://data.rijksmuseum.nl/object-metadata/api/
- Harvard Art Museums API: https://harvardartmuseums.org/collections/api

**Important:** These keys will be included in your client-side code, so don't include sensitive API keys that have access to private data or write operations.

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Change to project directory
cd art-collections

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
# Build the application
npm run build
```

## Deployment

The application is configured for easy deployment to Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `build`
4. Add your environment variables (API keys) in the Netlify dashboard
5. Deploy!

## Technology Stack

- React 18
- TypeScript
- Redux Toolkit for state management
- React Router v6 with data loaders
- Material UI for component library
- Lazy loading and image caching for performance
- Local storage for user collections persistence

## License

MIT
