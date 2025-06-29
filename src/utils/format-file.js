export const outputArrayCSV = (inputArray) => {
  if (inputArray.length === 0) return [];
  return inputArray.map((element) => element.replace(/\r/g, ''));
};

export const outputStringCSV = (string) => {
  if (!string) return '';
  return string
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((item) => item.trim())
    .map((item) => item.replace(/^"|"$/g, ''));
};

export const convertCSVToJson = (csvData, isFirstRowIsKey) => {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');

  const linesConverted = outputArrayCSV(lines);
  const headersConverted = outputArrayCSV(headers);
  const result = [];

  // eslint-disable-next-line no-plusplus
  for (let i = isFirstRowIsKey ? 1 : 0; i < linesConverted.length - 1; i++) {
    const obj = {};
    const currentLine = outputStringCSV(linesConverted[i]);

    if (isFirstRowIsKey) {
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < headersConverted.length; j++) {
        obj[headersConverted[j].replace(/^"|"$/g, '')] = currentLine[j];
      }

      result.push(obj);
    } else {
      result.push(currentLine);
    }
  }

  return result;
};
