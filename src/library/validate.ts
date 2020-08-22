const relativePathRegex = /^\.\.?$/;

const unixForbiddenCharRegex = /[\/\x00]/g;
function validateFilenameLinux(filename: string) {
  return !unixForbiddenCharRegex.test(filename) && !relativePathRegex.test(filename);
}

const winForbiddenCharRegex = /[<>:"\/\\|?*\x00-\x1F]/g;
function validateFilenameWin(filename: string) {
  return !winForbiddenCharRegex.test(filename) && !relativePathRegex.test(filename);
}

const isWin = process.platform === 'win32';
const validateFilename = isWin ? validateFilenameWin : validateFilenameLinux;

export function validateMangaId(id: string) {
  return validateFilename(id);
}

export function validateCollectionId(id: string) {
  if (id.length === 0) return true;
  return validateFilename(id);
}

export function validateChapterId(id: string) {
  if (id.length === 0) return true;
  return validateFilename(id);
}
