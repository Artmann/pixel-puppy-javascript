# @pixel-puppy/javascript

The official JavaScript/TypeScript library for [Pixel Puppy](https://pixelpuppy.io/) - transforms your images into optimized, web-ready assets.

Pixel Puppy is an image transformation service that helps you:
- Convert images to modern formats (WebP, PNG)
- Resize images while maintaining aspect ratio
- Optimize images for web performance

## Installation

```bash
npm install @pixel-puppy/javascript
```

or with Bun:

```bash
bun install @pixel-puppy/javascript
```

## Quick Start

```typescript
import { buildImageUrl } from '@pixel-puppy/javascript'

// Transform an image to WebP format
const imageUrl = buildImageUrl(
  'my-project',
  'https://example.com/photo.jpg'
)

// Use the URL in your HTML
console.log(imageUrl)
// Output: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp
```

## API Reference

### `buildImageUrl(projectSlug, originalImageUrl, options?)`

Builds a URL for the Pixel Puppy image transformation API.

#### Parameters

- **projectSlug** (string, required): Your Pixel Puppy project identifier
- **originalImageUrl** (string, required): The URL of the image to transform
- **options** (object, optional): Transformation settings
  - **format** ('webp' | 'png', optional): Output format. Defaults to 'webp'
  - **width** (number, optional): Desired width in pixels. Maintains aspect ratio

#### Returns

Returns a string containing the complete Pixel Puppy transformation URL.

#### Throws

- Error when `projectSlug` is not provided
- Error when `originalImageUrl` is not provided
- Error when `format` is not 'webp' or 'png'
- Error when `width` is not a valid positive number

## Usage Examples

### Basic transformation (default WebP)

```typescript
import { buildImageUrl } from '@pixel-puppy/javascript'

const url = buildImageUrl('my-project', 'https://example.com/photo.jpg')
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp
```

### Resize to specific width

```typescript
const url = buildImageUrl(
  'my-project',
  'https://example.com/photo.jpg',
  { width: 800 }
)
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp&width=800
```

### Convert to PNG format

```typescript
const url = buildImageUrl(
  'my-project',
  'https://example.com/photo.jpg',
  { format: 'png' }
)
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=png
```

### Resize and convert format

```typescript
const url = buildImageUrl(
  'my-project',
  'https://example.com/photo.jpg',
  {
    format: 'png',
    width: 1200
  }
)
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=png&width=1200
```

### Use in React

```tsx
import { buildImageUrl } from '@pixel-puppy/javascript'

function ProductImage({ imageUrl }: { imageUrl: string }) {
  const optimizedUrl = buildImageUrl('my-project', imageUrl, { width: 600 })

  return <img src={optimizedUrl} alt="Product" />
}
```

### Use in HTML

```javascript
import { buildImageUrl } from '@pixel-puppy/javascript'

const imageUrl = buildImageUrl(
  'my-project',
  'https://example.com/photo.jpg',
  { width: 800 }
)

document.querySelector('img').src = imageUrl
```

## TypeScript Support

This library is written in TypeScript and includes type definitions out of the box. No additional `@types` packages are needed.

```typescript
import { buildImageUrl, type TransformationOptions } from '@pixel-puppy/javascript'

const options: TransformationOptions = {
  format: 'webp',
  width: 1200
}

const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', options)
```

## Learn More

Visit [pixelpuppy.io](https://pixelpuppy.io/) to learn more about Pixel Puppy and sign up for an account.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
