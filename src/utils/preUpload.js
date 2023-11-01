import EXIF from 'exif-js';
// import mime from 'mime';

const getImageResizeFile = (
  img,
  maxWidth,
  maxHeight,
  oriFile,
  orientation,
  imgElem,
  filetype,
) => {
  let canvas = document.getElementById('tempCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'tempCanvas';
    canvas.style.display = 'none';
  }

  const ctx = canvas.getContext('2d');

  if (!maxWidth) {
    maxWidth = 800;
  }
  if (!maxHeight) {
    maxHeight = 400;
  }
  ctx.clearRect(0, 0, maxWidth, maxHeight);
  ctx.beginPath();

  const MAX_WIDTH = maxWidth;
  const MAX_HEIGHT = maxHeight;
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height;
      height = MAX_HEIGHT;
    }
  }

  if (orientation) {
    // set proper canvas dimensions before transform & export
    if ([5, 6, 7, 8].indexOf(orientation) > -1) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // transform context before drawing image
    switch (orientation) {
      case 2:
        ctx.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        ctx.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        ctx.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        ctx.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        ctx.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        ctx.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        ctx.transform(1, 0, 0, 1, 0, 0);
    }
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  // ctx.drawImage(img, -width/2, -height/2, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const type = filetype ? filetype : oriFile.type || 'image/png';
  const dataURL = canvas.toDataURL(type);
  if (imgElem) {
    imgElem.src = dataURL;
  }
  const blobBin = atob(dataURL.split(',')[1]);
  const array = [];
  for (let i = 0; i < blobBin.length; i++) {
    array.push(blobBin.charCodeAt(i));
  }

  // const ext = mime.getExtension(type);
  const file = new Blob([new Uint8Array(array)], {
    type,
  });
  const now = new Date();
  file.lastModified = now.getTime();
  file.lastModifiedDate = now;
  file.name = oriFile.name;
  return file;
};

export const checkExif = (file, maxWidth, maxHeight, filetype) => {
  return new Promise((resolve, reject) => {
    if (file.name && !file.name.match(/\.(jpg|jpeg|png|gif|ico)$/i)) {
      return reject({ message: `${file.name} - 이미지 파일이 아닙니다.` });
    }
    if (file.filename && !file.filename.match(/\.(jpg|jpeg|png|gif|ico)$/i)) {
      return reject({ message: `${file.filename} - 이미지 파일이 아닙니다.` });
    }

    try {
      EXIF.getData(file, function () {
        const orientation = EXIF.getTag(this, 'Orientation');
        // const exifCheck = EXIF.getTag(this, 'ExifIFDPointer');
        // const dateTime = EXIF.getTag(this, 'DateTimeOriginal');

        const fileReader = new FileReader();
        fileReader.onload = function (reader) {
          const img = new Image();
          img.onload = function () {
            const resizeFile = getImageResizeFile(
              this,
              maxWidth,
              maxHeight,
              file,
              orientation,
              null,
              filetype,
            );
            resizeFile.url = reader.target.result;
            resolve(resizeFile);
            // if (!isSelfUpload) {
            //   _self.uploadFile(_self, resizeFile, file.name, idx, cb);
            // } else {
            //   cb(_self, resizeFile, file.name, idx);
            // }
          };
          img.src = reader.target.result;
        };
        fileReader.readAsDataURL(file);
      });
    } catch (error) {
      reject(error);
    }
  });
};
