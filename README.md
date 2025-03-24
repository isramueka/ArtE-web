# ArtE Collections

A React TypeScript application for browsing and curating art collections from multiple museum APIs. Users can explore artworks from the Rijksmuseum and Harvard Art Museums, create personal exhibitions, and organize their favorite pieces.

## Features

- Browse artworks from multiple museum APIs
- Search and filter artwork collections
- View detailed information about each artwork
- Create personal exhibitions/collections 
- Add/remove artworks to/from exhibitions
- Social media sharing of artworks and exhibitions
- Responsive design for all devices

## Project Structure

```
art-collections/
├── public/               # Public assets and HTML template
│   ├── images/           # Static images
│   ├── index.html        # HTML template with Open Graph meta tags
│   ├── manifest.json     # Web app manifest
│   └── ...
├── src/
│   ├── api/              # API services and data fetching logic
│   │   ├── harvardArtMuseumsService.ts
│   │   ├── rijksMuseumService.ts
│   │   └── transformers.ts
│   ├── components/       # Reusable UI components
│   │   ├── CachedImage/  # Optimized image component with caching
│   │   ├── SocialShare/  # Social media sharing component
│   │   │   ├── SocialShare.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── ArtworkDetailPage/    # Individual artwork display
│   │   ├── ArtworksPage/         # Artwork listing and filtering
│   │   ├── ExhibitionsPage/      # User exhibitions management
│   │   ├── HomePage/             # Landing page
│   │   └── ...
│   ├── router/           # Routing configuration with route guards
│   │   └── AppRouter.tsx
│   ├── store/            # Redux state management
│   │   ├── artworkSlice.ts
│   │   ├── exhibitionsSlice.ts
│   │   └── ...
│   ├── theme/            # Material UI theme customization
│   │   └── theme.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── Artwork.ts
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   ├── imageCacheConfig.ts  # Image caching utilities
│   │   ├── socialShareUtils.ts  # Social sharing utilities
│   │   └── ...
│   ├── App.tsx           # Main application component
│   └── index.tsx         # Application entry point
├── .env                  # Environment variables (API keys)
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

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
- Open Graph and Twitter Card metadata for social sharing

## Key Features

### Social Media Integration

The application includes built-in social sharing functionality:

- **Shareable Links**: Direct URLs for each artwork and exhibition
- **Share Buttons**: Easy sharing to Twitter, Facebook, LinkedIn
- **Copy Link**: Clipboard functionality for sharing anywhere
- **Open Graph Metadata**: Enhanced link previews when shared on social platforms

Usage:

```tsx
import SocialShare from './components/SocialShare';
import { getArtworkShareUrl } from './utils/socialShareUtils';

// Menu variant (dropdown with options)
<SocialShare 
  url={getArtworkShareUrl(artworkId)}
  title={`Check out "${artworkTitle}" on Art Collections`}
/>

// Icon variant (direct buttons)
<SocialShare 
  url={getExhibitionShareUrl(exhibitionId)}
  title={`Check out my exhibition on Art Collections`}
  variant="icon"
  iconColor="primary"
/>
```

### Exhibition Management

Users can create personal exhibitions to curate their favorite artworks:

- Create, edit, and delete exhibitions
- Add artworks to exhibitions while browsing
- View all artworks in an exhibition
- Share exhibitions on social media

### Artwork Discovery

Browse and search through thousands of artworks from multiple museum APIs:

- Filter by artist, year, medium
- View detailed information including techniques, materials, colors
- High-resolution images with efficient caching
- Link to original museum sources

## License

MIT

# Art Collections - Share Component

## ShareButtons Component

The ShareButtons component provides social sharing functionality with proper metadata for various platforms.

### Usage

```tsx
import { ShareButtons } from './components/ShareButtons';

// Basic usage
<ShareButtons 
  url="/artwork/123" 
  title="Amazing Artwork" 
/>

// Advanced usage with all properties
<ShareButtons 
  url="/artwork/123"
  title="Amazing Artwork" 
  description="Check out this stunning artwork from our collection"
  imageUrl="https://yourdomain.com/images/artwork123.jpg"
  hashtags={["art", "collection", "exhibition"]}
  compact={false} // Set to true for icon-only display
/>
```

### How It Works

1. **Meta Tags**: The component automatically sets up Open Graph and Twitter Card meta tags when mounted, so shared links will show proper previews on social media platforms.

2. **Native Share**: On supported devices, uses the native share dialog.

3. **Custom Share Dialog**: Fallback for platforms without native sharing, with direct links to popular social platforms.

4. **Copy Link**: Allows users to easily copy the shareable URL.

### Troubleshooting

If shared links don't include title, description or images on social media platforms:

1. Make sure that the `imageUrl` is an absolute URL (or the component will try to make it absolute)
2. Test your URL with the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. Some platforms may cache metadata, so you might need to force a refresh
