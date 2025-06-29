/* eslint-disable no-plusplus */
export function convertToSlug(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function removeEmojiString(text) {
  return text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
}

export function getLastCharacterPosition(text) {
  let lineNumber = 1;
  let columnNumber = 1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '\n') {
      lineNumber++;
      columnNumber = 1;
    } else {
      columnNumber++;
    }
  }

  return { lineNumber, columnNumber };
}

export function removeVietnameseTones(str) {
  return str
    ? str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
    : '';
}
