export function findLastLineBeforeEndOfFunction(code, functionName) {
  let openBraces = 0;
  let functionStarted = false;
  let lastLineBeforeEnd = 0;
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();

    if (
      line.startsWith(`function ${functionName}`) ||
      line.startsWith(`async function ${functionName}`) ||
      line.includes(`${functionName}(`)
    ) {
      functionStarted = true;
      openBraces = 0;
    }

    if (functionStarted) {
      if (line.includes('{')) {
        openBraces += 1;
      }
      if (line.includes('}')) {
        openBraces -= 1;
        if (openBraces === 0) {
          lastLineBeforeEnd = i;
          break;
        }
      }
    }
  }

  const lineContent = lastLineBeforeEnd > 0 ? lines[lastLineBeforeEnd - 1].trim() : '';

  let linePosition = lastLineBeforeEnd || 0;

  if (lineContent !== '') {
    linePosition += 1;
  }

  return linePosition;
}

export function getLogColor(type) {
  switch (type) {
    case 'log':
      return '#ffffff';
    case 'error':
      return '#ff4d4f';
    case 'warn':
      return '#faad14';
    case 'info':
      return '#0bd542';
    case 'dir':
      return '#52c41a';
    case 'error_log':
      return '#ff4d4f';
    default:
      return '#282828';
  }
}

export function getLogStatus(type) {
  switch (type) {
    case 'log':
      return '[Log]';
    case 'error':
      return '[Thất bại]';
    case 'warn':
      return '[Cảnh báo]';
    case 'info':
      return '[Thành công]';
    case 'dir':
      return '[Dir]';
    case 'error_log':
      return '[Chi tiết lỗi]';
    default:
      return '[Info]';
  }
}

export function generateScriptLogVariable(variables, nodeId) {
  if (!variables) return '';
  const valirable_names = variables.map((variable) => variable.key);
  return `\n console.log("|M|K|T|L|O|G|I|N|||VARIABLES|STATES|${nodeId}", {${valirable_names.join(
    ','
  )}});`;
}

export function cleanedJSCode(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '');
}

export function replaceObjectValuesWithKeys(input) {
  const regex = /logConsole\(".*?",\s*(\{.*\})\)/;
  const match = input.match(regex);
  if (!match) return input;

  const originalObjectString = match[1];
  let parsedObject;

  try {
    const fixedObjectString = originalObjectString.replace(/`/g, '"');
    parsedObject = JSON.parse(fixedObjectString);
  } catch (error) {
    console.error('Lỗi khi parse object:', error);
    return input;
  }

  function convertValuesToKeys(obj) {
    const result = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [key] of Object.entries(obj)) {
      if (!key.includes('loop.')) {
        result[key] = key;
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  }

  const updatedObject = convertValuesToKeys(parsedObject);

  const updatedObjectString = Object.entries(updatedObject)
    .map(([key, value]) => `"${key}":${value}`)
    .join(',');

  const result = input.replace(originalObjectString, `{${updatedObjectString}}`);
  return result;
}
