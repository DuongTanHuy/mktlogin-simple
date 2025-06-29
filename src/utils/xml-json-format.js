/* eslint-disable import/no-extraneous-dependencies */
import xmljs from 'xml-js';

export const convertXmlToJson = (xmlString) => {
  let complete = null;
  try {
    const jsonResult = xmljs.xml2json(xmlString, { compact: true, spaces: 2 });
    complete = JSON.parse(jsonResult);
  } catch (error) {
    complete = null;
  }
  return complete;
};

export const convertJsonToXml = (jsonObject) => {
  const xmlOptions = { compact: true, spaces: 2 };
  const xmlString = xmljs.js2xml(jsonObject, xmlOptions);

  return xmlString;
};
