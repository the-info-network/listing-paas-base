# @listing-platform/media

Media SDK for image galleries, video players, and virtual tours.

## Features

- **Image Gallery** - Lightbox with zoom, swipe navigation
- **Image Upload** - Drag-and-drop with progress
- **Video Player** - Responsive video with controls
- **Virtual Tours** - 360° panorama viewer
- **Thumbnails** - Auto-generated thumbnails

## Usage

```tsx
import { ImageGallery, ImageUploader, VideoPlayer, VirtualTour } from '@listing-platform/media';

<ImageGallery images={images} onImageClick={(index) => setLightbox(index)} />
<ImageUploader onUpload={(files) => handleUpload(files)} maxFiles={10} />
<VideoPlayer src={videoUrl} poster={thumbnailUrl} />
<VirtualTour panoramaUrl={panoramaUrl} />
```

## License

MIT
