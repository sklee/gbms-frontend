import moment from 'moment';
import mime from 'mime';

export const formatFilename = (mimetype, uploadPath) => {
  const date = moment().format('YYYYMMDD-HHmmss');
  const randomString = Math.random().toString(36).substring(2, 7);
  const newFilename = `${
    uploadPath ? uploadPath + '/' : ''
  }${date}-${randomString}.${mime.getExtension(mimetype)}`;
  return newFilename;
};

export const fileType = (mimetype) => {
  return mime.getExtension(mimetype);
};

export const dateNumFormat = (value) => {
  value = parseInt(value);
  if (isNaN(value)) {
    return '';
  }
  return value < 10 ? '0' + value : value;
};

export const numberWithCommas = (x) => {
  return x ? String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
};
