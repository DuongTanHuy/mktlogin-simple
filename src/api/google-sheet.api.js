import axios from 'axios';

function convertToStructuredJson(sheetData) {
  const [headers, ...rows] = sheetData.values;
  return rows.map(row => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}

const constructSheetUrl = (sheet_id, sheet_name = '', range = '') => {
  let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${encodeURIComponent(sheet_name)}`;
  if (range) {
    url += `!${range}`;
  }
  return url;
};

export const readGoogleSheet = async (
  sheet_id,
  access_token,
  { range = '', sheet_name = '', is_choose_first_rows_as_key = true } = {}
) => {
  try {
    if (!sheet_name) {
      const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}?fields=sheets.properties.title`;
      const { data: { sheets } } = await axios.get(metadataUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (sheets?.length > 0) {
        sheet_name = sheets[0].properties.title;
      } else {
        throw new Error('No sheets found in the spreadsheet.');
      }
    }

    const url = constructSheetUrl(sheet_id, sheet_name, range);
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (is_choose_first_rows_as_key && data?.values?.length > 0) {
      return convertToStructuredJson(data);
    }

    return data.values;
  } catch (error) {
    console.error(`Error reading Google Sheet: ${error.message}`);
    throw error;
  }
};
