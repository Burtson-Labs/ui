import * as React from 'react';

import { Button, ImageGallery, ImageLightbox, MessageAttachments } from '@burtson-labs/ui';

const images = [
  {
    src: '/demo/bar-chart.png',
    alt: 'Bar chart of detention minutes by terminal; Phillips 66 KC is highest at 58',
    caption: 'detention-by-terminal.png',
  },
  {
    src: '/demo/line-chart.png',
    alt: 'Line chart of weekly fuel surcharge, rising over eleven weeks',
    caption: 'surcharge-trend.png',
  },
  {
    src: '/demo/terminal-dusk.png',
    alt: 'Illustration of a fuel terminal at dusk with six storage tanks',
    caption: 'terminal.png',
  },
];

export default function ImageLightboxDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="grid w-full max-w-xl gap-5">
      <ImageGallery images={images} />
      <MessageAttachments
        lightbox
        files={[
          {
            name: 'surcharge-trend.png',
            type: 'image/png',
            href: images[1]?.src,
            alt: images[1]?.alt,
          },
          { name: 'notes.txt', size: 1_204, type: 'text/plain' },
        ]}
      />
      <div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Open a single image
        </Button>
        <ImageLightbox images={images.slice(0, 1)} open={open} onOpenChange={setOpen} />
      </div>
    </div>
  );
}
