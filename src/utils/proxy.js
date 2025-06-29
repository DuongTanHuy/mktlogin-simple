import { isSpecialString } from './commom';
import { decryptProxyTokenMktCity } from './profile';

export const takeHostProxyToken = (proxyToken) => {
  let proxy_host = '';
  try {
    let proxy_token_decoded = atob(proxyToken);
    const proxy_arr = proxy_token_decoded.split(':');
    if (!isSpecialString(proxy_token_decoded)) {
      const proxy_host_array = proxy_arr[0].split('-');
      if (proxy_host_array.length >= 1) {
        proxy_host = proxy_host_array.pop();
      }
    } else {
      proxy_token_decoded = decryptProxyTokenMktCity(proxyToken);
      if (proxy_token_decoded.split('|').length === 3) {
        proxy_host = proxy_token_decoded.split('|')[1];
      }
    }
  } catch (error) {
    /* empty */
  }
  return proxy_host;
};
