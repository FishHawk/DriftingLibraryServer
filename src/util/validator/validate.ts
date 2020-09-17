const relativePathRegex = /^\.\.?/;

const unixForbiddenCharRegex = /[\/\x00]/g;
function validateFilenameLinux(filename: string) {
  return !unixForbiddenCharRegex.test(filename) && !relativePathRegex.test(filename);
}

const winForbiddenCharRegex = /[<>:"\/\\|?*\x00-\x1F]/g;
function validateFilenameWin(filename: string) {
  return !winForbiddenCharRegex.test(filename) && !relativePathRegex.test(filename);
}

const isWin = process.platform === 'win32';
export const validateFilename = isWin ? validateFilenameWin : validateFilenameLinux;
