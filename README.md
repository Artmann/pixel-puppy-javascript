# @pixel-puppy/javascript

The official JavaScript/TypeScript library for
[Pixel Puppy](https://pixelpuppy.io/) - transforms your images into optimized,
web-ready assets with responsive image support.

Pixel Puppy is an image transformation service that helps you:

- Convert images to modern formats (WebP, PNG)
- Resize images while maintaining aspect ratio
- Optimize images for web performance
- Generate responsive images with automatic srcset and sizes
- Support retina/high-DPI displays with DPR strategies

## Installation

```bash
npm install @pixel-puppy/javascript
```

or with Bun:

```bash
bun install @pixel-puppy/javascript
```

## Quick Start

### Simple Image Transformation

```typescript
import { buildImageUrl } from '@pixel-puppy/javascript'

// Transform an image to WebP format
const imageUrl = buildImageUrl('my-project', 'https://example.com/photo.jpg')

// Use the URL in your HTML
console.log(imageUrl)
// Output: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp
```

### Responsive Images

```typescript
import { getResponsiveImageAttributes } from '@pixel-puppy/javascript'

// Generate responsive image attributes
const attrs = getResponsiveImageAttributes(
  'my-project',
  'https://example.com/photo.jpg',
  { width: 800 }
)

// Use in your HTML
const img = document.createElement('img')

img.src = attrs.src
img.srcset = attrs.srcSet
img.width = attrs.width
// Automatically generates 1x and 2x images for retina displays
```

## API Reference

### `buildImageUrl(projectSlug, originalImageUrl, options?)`

Builds a URL for the Pixel Puppy image transformation API.

#### Parameters

- **projectSlug** (string, required): Your Pixel Puppy project identifier
- **originalImageUrl** (string, required): The URL of the image to transform
- **options** (object, optional): Transformation settings
  - **format** ('webp' | 'png', optional): Output format. Defaults to 'webp'
  - **width** (number, optional): Desired width in pixels. Maintains aspect
    ratio

#### Returns

Returns a string containing the complete Pixel Puppy transformation URL.

#### Throws

- Error when `projectSlug` is not provided
- Error when `originalImageUrl` is not provided
- Error when `format` is not 'webp' or 'png'
- Error when `width` is not a valid positive number

---

### `getResponsiveImageAttributes(projectSlug, originalImageUrl, options?)`

Generates optimized responsive image attributes (`src`, `srcSet`, `sizes`) for
use in `<img>` tags. Automatically selects the best strategy based on provided
options.

#### Strategies

The function intelligently chooses between four strategies:

1. **Non-responsive Strategy** (responsive: false): Returns only a single src
   URL with no srcset or sizes. Use this when you want a specific image size
   without responsive behavior.

2. **Default Strategy** (no width or sizes): Uses all device breakpoints with
   `sizes="100vw"`. Generates srcset with w-descriptors for common device
   widths (480w, 640w, 750w, etc.). Ideal for full-width images.

3. **Width-based Strategy** (width provided, no sizes): Generates srcset with
   ALL common device breakpoints PLUS the provided width PLUS a 2x variant.
   Uses w-descriptors and sets `sizes="(min-width: 1024px) 1024px, 100vw"`.
   Ensures mobile alternatives are always available.

4. **Sizes-based Strategy** (sizes provided): Generates multiple image widths
   using common device breakpoints, filtered based on the smallest vw value in
   the sizes attribute. Uses w-descriptors (`640w`, `1920w`, etc.).

#### Parameters

- **projectSlug** (string, required): Your Pixel Puppy project identifier
- **originalImageUrl** (string, required): The URL of the image to transform
- **options** (object, optional):
  - **width** (number, optional): Display width in pixels
  - **sizes** (string, optional): HTML sizes attribute value
  - **format** ('webp' | 'png', optional): Output format. Defaults to 'webp'
  - **responsive** (boolean, optional): Whether to generate responsive image
    attributes (srcset, sizes). When false, returns only a single src URL.
    Defaults to true
  - **deviceBreakpoints** (number[], optional): Custom device width breakpoints.
    Defaults to `[480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]`
  - **imageBreakpoints** (number[], optional): Custom image width breakpoints
    for small images. Defaults to `[16, 32, 48, 64, 96, 128, 256, 384]`

#### Returns

Returns an object with:

- **src** (string): Fallback image URL
- **srcSet** (string): Complete srcset attribute value (empty string when
  responsive: false)
- **sizes** (string, optional): Sizes attribute value (not present for
  non-responsive mode)
- **width** (number, optional): Width attribute value (only for width-based
  strategy)

## Usage Examples

### Basic transformation (default WebP)

```typescript
import { buildImageUrl } from '@pixel-puppy/javascript'

const url = buildImageUrl('my-project', 'https://example.com/photo.jpg')
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp
```

### Resize to specific width

```typescript
const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', {
  width: 800
})
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp&width=800
```

### Convert to PNG format

```typescript
const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', {
  format: 'png'
})
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=png
```

### Resize and convert format

```typescript
const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', {
  format: 'png',
  width: 1200
})
// https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=png&width=1200
```

### Use in React

```tsx
import { buildImageUrl } from '@pixel-puppy/javascript'

function ProductImage({ imageUrl }: { imageUrl: string }) {
  const optimizedUrl = buildImageUrl('my-project', imageUrl, { width: 600 })

  return (
    <img
      src={optimizedUrl}
      alt="Product"
    />
  )
}
```

### Use in HTML

```javascript
import { buildImageUrl } from '@pixel-puppy/javascript'

const imageUrl = buildImageUrl('my-project', 'https://example.com/photo.jpg', {
  width: 800
})

document.querySelector('img').src = imageUrl
```

---

## Responsive Images Examples

### Non-responsive Mode (Single URL)

Generate a single optimized image URL without responsive behavior:

```typescript
import { getResponsiveImageAttributes } from '@pixel-puppy/javascript'

const attrs = getResponsiveImageAttributes(
  'my-project',
  'https://example.com/photo.jpg',
  { width: 800, responsive: false }
)

// Use in HTML
const img = document.createElement('img')
img.src = attrs.src
img.alt = 'Photo'

// attrs.src: "...&width=800"
// attrs.srcSet: "" (empty)
// No sizes or width attribute
```

### Default Strategy (Full-Width Images)

Ideal for hero images and full-width banners:

```typescript
const attrs = getResponsiveImageAttributes(
  'my-project',
  'https://example.com/photo.jpg'
)

// attrs.srcSet: "...&width=480 480w, ...&width=640 640w, ...&width=1920 1920w, ...&width=3840 3840w"
// attrs.sizes: "100vw"
```

### Width-based Strategy (Fixed Width with Mobile Alternatives)

Generates ALL device breakpoints plus your width plus 2x variant:

```typescript
const attrs = getResponsiveImageAttributes(
  'my-project',
  'https://example.com/photo.jpg',
  { width: 800 }
)

// Use in HTML
const img = document.createElement('img')
img.src = attrs.src // Uses 800 as fallback
img.srcset = attrs.srcSet
img.sizes = attrs.sizes
img.width = attrs.width // 800
img.alt = 'Photo'

// attrs.srcSet: "...&width=480 480w, ...&width=640 640w, ...&width=800 800w, ...&width=1600 1600w (2x), ...&width=3840 3840w"
// attrs.sizes: "(min-width: 1024px) 1024px, 100vw"
// attrs.width: 800
```

### Sizes-based Strategy (Custom Responsive Behavior)

Filter breakpoints based on your sizes attribute:

```typescript
const attrs = getResponsiveImageAttributes(
  'my-project',
  'https://example.com/photo.jpg',
  {
    width: 800,
    sizes: '(min-width: 768px) 50vw, 100vw'
  }
)

// Use in HTML
const img = document.createElement('img')
img.src = attrs.src
img.srcset = attrs.srcSet
img.sizes = attrs.sizes
img.alt = 'Photo'

// attrs.srcSet: "...&width=640 640w, ...&width=750 750w, ...&width=800 800w, ..."
// attrs.sizes: "(min-width: 768px) 50vw, 100vw"
// Automatically filters out breakpoints smaller than needed based on 50vw
```

### Custom Breakpoints

Override default breakpoints for specific use cases:

```typescript
const attrs = getResponsiveImageAttributes(
  'my-project',
  'https://example.com/photo.jpg',
  {
    sizes: '100vw',
    deviceBreakpoints: [400, 800, 1200, 1600] // Custom breakpoints
  }
)

// Only generates srcset for your custom widths
```

### React Component Example

```tsx
import { getResponsiveImageAttributes } from '@pixel-puppy/javascript'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  sizes?: string
}

function ResponsiveImage({ src, alt, width, sizes }: ResponsiveImageProps) {
  const attrs = getResponsiveImageAttributes('my-project', src, {
    width,
    sizes
  })

  return (
    <img
      src={attrs.src}
      srcSet={attrs.srcSet}
      sizes={attrs.sizes}
      width={attrs.width}
      alt={alt}
      loading="lazy"
    />
  )
}

// Usage: Fixed-width image with retina support
<ResponsiveImage
  src="https://example.com/photo.jpg"
  alt="Product"
  width={400}
/>

// Usage: Responsive image
<ResponsiveImage
  src="https://example.com/photo.jpg"
  alt="Hero"
  sizes="(min-width: 1024px) 1024px, 100vw"
/>
```

### Next.js Example

```tsx
import { getResponsiveImageAttributes } from '@pixel-puppy/javascript'

export default function ProductImage({ imageUrl }: { imageUrl: string }) {
  const attrs = getResponsiveImageAttributes('my-project', imageUrl, {
    width: 600,
    sizes: '(min-width: 1024px) 600px, (min-width: 768px) 50vw, 100vw'
  })

  return (
    <img
      {...attrs}
      alt="Product"
      className="rounded-lg"
      loading="lazy"
      decoding="async"
    />
  )
}
```

## TypeScript Support

This library is written in TypeScript and includes type definitions out of the
box. No additional `@types` packages are needed.

```typescript
import {
  buildImageUrl,
  getResponsiveImageAttributes,
  type ResponsiveImageOptions,
  type ResponsiveImageAttributes
} from '@pixel-puppy/javascript'

// Type-safe options
const options: ResponsiveImageOptions = {
  width: 800,
  sizes: '(min-width: 768px) 50vw, 100vw',
  format: 'webp'
}

const attrs: ResponsiveImageAttributes = getResponsiveImageAttributes(
  'my-project',
  'https://example.com/photo.jpg',
  options
)
```

## Learn More

Visit [pixelpuppy.io](https://pixelpuppy.io/) to learn more about Pixel Puppy
and sign up for an account.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
