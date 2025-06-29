import axios from 'axios';
import { HOST_API } from 'src/config-global';
import { getStorage } from 'src/hooks/use-local-storage';
import axiosInstance from 'src/utils/axios';

const token = getStorage('accessToken');

export const getURLImage = async (file) => {
  const bodyFormData = new FormData();
  bodyFormData.append('filename', file?.name);
  bodyFormData.append('image', file);

  const result = await axios({
    method: 'post',
    url: `${HOST_API}/api/v1/products/upload-img`,
    data: bodyFormData,
    headers: { 'Content-Type': 'multipart/form-data', Authorization: token },
  })
    .then((response) => response)
    .catch((errors) => errors);
  return result?.data?.img_url || '';
};

export const getQrCodeApi = (payload) =>
  axiosInstance.post(process.env.REACT_APP_QR_CODE_GENERATE_API, payload);
