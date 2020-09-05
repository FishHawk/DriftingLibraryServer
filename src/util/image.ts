interface MimePattern {
  ext: string;
  mime: string;
  pattern: (number | undefined)[];
}

const imageMimes: MimePattern[] = [
  {
    // JPEG images
    ext: 'jpg',
    mime: 'image/jpeg',
    pattern: [0xff, 0xd8, 0xff],
  },
  {
    // Portable Network Graphics
    ext: 'png',
    mime: 'image/png',
    pattern: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  {
    // WEBP image
    ext: 'webp',
    mime: 'image/webp',
    pattern: [
      0x52,
      0x49,
      0x46,
      0x46,
      undefined,
      undefined,
      undefined,
      undefined,
      0x57,
      0x45,
      0x42,
      0x50,
    ],
  },
];

function check(buffer: Buffer, mime: MimePattern) {
  return mime.pattern.every((p, i) => !p || buffer[i] === p);
}

export class UnknownImageTypeError {}

export class Image {
  private constructor(
    private readonly ext: string,
    private readonly mime: string,
    private readonly buffer: Buffer
  ) {}

  static fromBuffer(buffer: Buffer): Image {
    for (const mime of imageMimes) {
      if (check(buffer, mime)) return new Image(mime.ext, mime.mime, buffer);
    }
    throw new UnknownImageTypeError();
  }
}
