import { every, includes, map } from 'lodash';
import numeral from 'numeral';

// ----------------------------------------------------------------------

export function fNumber(number) {
  return numeral(number).format();
}

export function fCurrency(number) {
  const format = number ? numeral(number).format('$0,0.00') : '';

  return result(format, '.00');
}

export function fCurrencyVND(number) {
  const format = number ? numeral(number).format('0,0') : '';

  return format;
}

export function fPercent(number) {
  const format = number ? numeral(Number(number) / 100).format('0.0%') : '';

  return result(format, '.0');
}

export function fShortenNumber(number) {
  const format = number ? numeral(number).format('0.00a') : '';

  return result(format, '.00');
}

export function fData(number) {
  const format = number ? numeral(number).format('0.0 b') : '';

  return result(format, '.0');
}

export function createRangeArray(min, max) {
  const range = max - min;
  let step;

  if (range <= 150) {
    step = 10;
  } else if (range <= 1000) {
    step = 100;
  } else if (range <= 10000) {
    step = 1000;
  } else {
    step = 10000;
  }

  const adjustedMin = Math.ceil(min / step) * step;
  const adjustedMax = Math.floor(max / step) * step;

  const resultArr = [min];
  for (let i = adjustedMin; i <= adjustedMax; i += step) {
    if (i !== min && i !== max) {
      resultArr.push(i);
    }
  }
  if (max !== result[result.length - 1]) {
    resultArr.push(max);
  }

  return resultArr;
}

function result(format, key = '.00') {
  const isInteger = format.includes(key);

  return isInteger ? format.replace(key, '') : format;
}

export function isSubset(arrayA, arrayB, key = 'id') {
  const idsInB = map(arrayB, key);

  return every(arrayA, (obj) => includes(idsInB, obj.id));
}
