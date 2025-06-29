export const isElectron = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('electron');
};

export function objectToQueryString(obj) {
  return `?${Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')}`;
}

export async function createDeviceId() {
  const { userAgent } = navigator;

  const encoder = new TextEncoder();
  const data = encoder.encode(userAgent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function getNumSkeleton(rowPerPage = 10, dataLength = 0, maxValue = 20) {
  const maxRows = Math.min(rowPerPage, maxValue);
  const result = Math.min(dataLength || maxRows, maxRows);
  return result;
}

export function isSpecialString(str) {
  for (let i = 0; i < str.length; i += 1) {
    const charCode = str.charCodeAt(i);
    if (charCode < 32 || charCode > 126) {
      return true;
    }
  }
  return false;
}

export function sortNode(startNodeId, nodeMap, edgeMap) {
  const queue = [startNodeId];
  const visited = new Set();
  const sortedNodes = [];
  try {
    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      if (!visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        if (nodeMap[currentNodeId]) {
          sortedNodes.push(nodeMap[currentNodeId]);
        }

        if (edgeMap[currentNodeId]) {
          edgeMap[currentNodeId].forEach((targetNodeId) => {
            if (!visited.has(targetNodeId)) {
              queue.push(targetNodeId);
            }
          });
        }
      }
    }
  } catch (error) {
    /* empty */
  }

  return sortedNodes;
}
export const generateRandomString = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};

export const getOperator = (operator) => {
  switch (operator) {
    case 'equals':
      return '==';
    case 'equals_case_insensitive':
      return '===';
    case 'not_equals':
      return '!==';
    case 'greater_than':
      return '>';
    case 'greater_than_or_equals':
      return '>=';
    case 'less_than':
      return '<';
    case 'less_than_or_equals':
      return '<=';
    case 'contains':
      return (substring) => `?.includes(\`${substring}\`)`;
    case 'contains_case_insensitive':
      return (substring) => `?.toLowerCase().includes(\`${substring}\`?.toLowerCase())`;
    case 'not_contains':
      return (substring) => `?.indexOf(\`${substring}\`) === -1`;
    case 'not_contains_case_insensitive':
      return (substring) => `?.toLowerCase().indexOf(\`${substring}\`?.toLowerCase()) === -1`;
    case 'starts_with':
      return (prefix) => `?.startsWith(\`${prefix}\`)`;
    case 'ends_with':
      return (suffix) => `?.endsWith(\`${suffix}\`)`;
    case 'matches_with_regex':
      return (regex) => `?.match(\`${regex}\`)`;
    case 'is_truthy':
      return '=== true';
    case 'is_falsy':
      return '=== false';
    default:
      return '';
  }
};

const getRightValue = (rightType, rightValue) => {
  switch (rightType) {
    case 'value': {
      return `${rightValue}`;
    }

    case 'element_text': {
      return `(await rpa.F_getTextBySelector(\`${rightValue}\`))`;
    }

    default:
      return '';
  }
};

export const generateOperation = ({ leftType, leftValue, rightType, rightValue, operator }) => {
  const op = getOperator(operator);
  const rightVal = getRightValue(rightType, rightValue);

  const formatValue = (val, type) => {
    const isFunc = type === 'element_text';
    const isBoolean = ['is_truthy', 'is_falsy'].includes(operator);

    if (isBoolean) {
      val = val.replace(/\$\{|\}/g, '');
      return `${val}`;
    }

    if (isFunc) {
      return ['>', '>=', '<', '<='].includes(op) ? `Number(${val})` : `${val}`;
    }

    return ['>', '>=', '<', '<='].includes(op) ? `Number(\`${val}\`)` : `\`${val}\``;
  };

  switch (leftType) {
    case 'value': {
      return `${formatValue(leftValue)}${
        typeof op === 'function'
          ? op(rightVal)
          : ` ${
              ['is_truthy', 'is_falsy'].includes(operator)
                ? op
                : `${op} ${formatValue(rightVal, rightType)}`
            }`
      }`;
    }

    case 'data_exists':
      return `${convertToOptionalChaining(leftValue)
        .replaceAll('{{', '')
        .replaceAll('}}', '')
        .replaceAll('${', '')
        .replaceAll('}', '')}`;

    case 'data_not_exists':
      return `!${convertToOptionalChaining(leftValue)
        .replaceAll('{{', '')
        .replaceAll('}}', '')
        .replaceAll('${', '')
        .replaceAll('}', '')}`;

    case 'element_text': {
      return `(await rpa.F_getTextBySelector(${formatValue(leftValue)}))${
        typeof op === 'function'
          ? op(rightVal)
          : ` ${
              ['is_truthy', 'is_falsy'].includes(operator)
                ? op
                : `${op} ${formatValue(rightVal, rightType)}`
            }`
      }`;
    }

    case 'element_exists':
      return `await rpa.F_checkExistElement(\`${leftValue}\`)`;

    case 'element_not_exists':
      return `!(await rpa.F_checkExistElement(\`${leftValue}\`))`;

    default:
      return '';
  }
};

export const normalizeString = (str) => {
  if (typeof str === 'string') {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
  return '';
};

export const convertToOptionalChaining = (path) => path.split('.').join('?.');

export const getFileFromUrl = async (url, filename, mimeType = 'image/jpeg') => {
  const res = await fetch(url);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: mimeType });

  return Object.assign(file, {
    preview: URL.createObjectURL(file),
  });
};

export const detectBrowser = (userAgent) => {
  const browsers = {
    chrome: /chrome/i,
    safari: /safari/i,
    firefox: /firefox/i,
    ie: /internet explorer/i,
    edge: /edge/i,
    opera: /opera/i,
  };

  let browserName = Object.keys(browsers).find((browser) => browsers[browser].test(userAgent));

  if (!browserName) {
    browserName = '';
  }

  browserName = browserName.toUpperCase();

  return browserName;
};
