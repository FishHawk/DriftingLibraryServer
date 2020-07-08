const relativePathRegex = /^\.\.?$/;

const unixForbiddenCharRegex = /[\/\x00]/g;
export function validateFilenameLinux(filename) {
  return (
    typeof filename === 'string' &&
    !unixForbiddenCharRegex.test(filename) &&
    !relativePathRegex.test(filename)
  );
}

const winForbiddenCharRegex = /[<>:"\/\\|?*\x00-\x1F]/g;
export function validateFilenameWin(filename) {
  return (
    typeof filename === 'string' &&
    !winForbiddenCharRegex.test(filename) &&
    !relativePathRegex.test(filename)
  );
}

const isWin = process.platform === 'win32';
export const validateFilename = isWin
  ? validateFilenameWin
  : validateFilenameLinux;
