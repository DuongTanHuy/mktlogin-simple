import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat, options = {}) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm, options) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function toLocalTimeISOString(date, offset = 7) {
  // Tạo một bản sao của date object để tránh thay đổi giá trị gốc
  const localDate = new Date(date.getTime());

  // Tính toán sự chênh lệch thời gian bằng milisecond
  // Lưu ý: offset là số giờ chênh lệch so với UTC, ví dụ GMT+7 là 7
  const timeOffsetInMilliseconds = offset * 60 * 60 * 1000;

  // Áp dụng sự chênh lệch vào date object
  localDate.setTime(localDate.getTime() + timeOffsetInMilliseconds);

  // Định dạng chuỗi thời gian
  // Bạn có thể điều chỉnh định dạng này theo yêu cầu cụ thể của bạn
  const year = localDate.getUTCFullYear();
  const month = `0${localDate.getUTCMonth() + 1}`.slice(-2); // Thêm 0 ở đầu nếu cần
  const day = `0${localDate.getUTCDate()}`.slice(-2);
  const hours = `0${localDate.getUTCHours()}`.slice(-2);
  const minutes = `0${localDate.getUTCMinutes()}`.slice(-2);
  const seconds = `0${localDate.getUTCSeconds()}`.slice(-2);

  // Tạo chuỗi datetime theo định dạng YYYY-MM-DD HH:MM:SS
  const datetimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return datetimeString;
}

export const convertTimeStringToDate = (timeString) => {
  const today = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  today.setHours(hours, minutes, 0, 0);

  return today;
};
