import { pipeline } from './stream';

const mimeToExt: Record<string, string | undefined> = {};
const extToMine: Record<string, string | undefined> = {};

function bindMimeToExt(ext: string, mime: string) {
  mimeToExt[mime] = ext;
  extToMine[ext] = mime;
}

bindMimeToExt('bmp', 'image/bmp');
bindMimeToExt('jpeg', 'image/jpeg');
bindMimeToExt('jpg', 'image/jpeg');
bindMimeToExt('png', 'image/png');
bindMimeToExt('gif', 'image/gif');
bindMimeToExt('webp', 'image/webp');

export class Image {
  private constructor(
    readonly mime: string,
    readonly ext: string,
    readonly stream: NodeJS.ReadableStream,
    readonly contentLength: number
  ) {}

  pipe(w: NodeJS.WritableStream) {
    return pipeline(this.stream, w);
  }

  static fromMime(
    mime: string,
    stream: NodeJS.ReadableStream,
    contentLength: number = 0
  ) {
    mime = mime.toLowerCase();
    const ext = mimeToExt[mime];
    if (ext === undefined) return undefined;
    return new Image(mime, ext, stream, contentLength);
  }

  static fromExt(
    ext: string,
    stream: NodeJS.ReadableStream,
    contentLength: number = 0
  ) {
    ext = ext.toLowerCase();
    const mime = extToMine[ext];
    if (mime === undefined) return undefined;
    return new Image(mime, ext, stream, contentLength);
  }

  static isImageMimeType(mime: string) {
    mime = mime.toLowerCase();
    return mimeToExt[mime] !== undefined;
  }

  static isImageExtension(ext: string) {
    ext = ext.toLowerCase();
    return extToMine[ext] !== undefined;
  }
}
