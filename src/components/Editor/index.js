/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import uniqid from 'uniqid';

import ReactQuill, { Quill } from 'react-quill';
import BlotFormatter, { ImageSpec } from 'quill-blot-formatter';
import { ImageDrop } from 'quill-image-drop-module';
import MagicUrl from 'quill-magic-url';
import QuillPasteSmart from 'quill-paste-smart';
import ImageUploader from 'quill-image-uploader';
import ImageCompress from 'quill-image-compress';

import useStore from '@stores/useStore';
import { formatFilename } from '@utils/common';

import { ImageFormat, VideoFormat, VideoBase } from './customFormat';
import EDITOR_COLORS from './editorColors';

Quill.register('modules/blotFormatter', BlotFormatter);
Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/magicUrl', MagicUrl);
Quill.register('modules/clipboard', QuillPasteSmart);
Quill.register('modules/imageUploader', ImageUploader);
Quill.register('modules/imageCompress', ImageCompress);
// Quill.register('formats/video', VideoFormat);

Quill.register('formats/image', ImageFormat);
Quill.register('formats/video', VideoFormat);

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'size',
  'color',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'align',
  'style',
  'width',
  'height',
];

const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;
const __ISIOS__ = navigator.userAgent.match(/iPad|iPhone|iPod/i) ? true : false;

class VideoSpec extends ImageSpec {
  init() {
    let vm = this;

    this.formatter.quill.root.addEventListener('click', function (event) {
      event.stopPropagation();
      let el = event.target;

      if (
        !el.getAttribute('src') &&
        (!(el instanceof HTMLElement) ||
          !el.classList.contains('ql-video-wrapper'))
      ) {
        return;
      }

      vm.img = el;
      vm.formatter.show(vm);
    });
  }
}

const Editor = observer((props) => {
  const { commonStore } = useStore();
  const quillRef = useRef();

  const state = useLocalStore(() => ({
    content: '',
  }));

  const handleChange = useCallback((value) => {
    state.content = value;
  }, []);

  const preSave = useCallback(
    (isFormValid) => {
      if (!quillRef.current) {
        return Promise.resolve('');
      }
      return new Promise(async (resolve) => {
        if (isFormValid) {
          return resolve(quillRef.current.getEditorContents());
        }

        commonStore.loading = true;

        const editorContents = quillRef.current.getEditor().getContents();
        const uploadFiles = [];
        const replaceEditorBase64 = {};

        for (const obj of editorContents.ops) {
          if (obj.insert && obj.insert instanceof Object && obj.insert.image) {
            const dataURL = obj.insert.image;
            let type = dataURL.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);

            if (type && dataURL.split(',')[1]) {
              type = type[0];
              const blobBin = atob(dataURL.split(',')[1]);
              const array = [];
              for (let i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
              }

              // const ext = mime.getExtension(type);
              const file = new Blob([new Uint8Array(array)], {
                type,
              });

              const uid = uniqid();
              file.uid = uid;
              uploadFiles.push(file);
              replaceEditorBase64[uid] = dataURL;
            }
          }
        }

        let content = quillRef.current.getEditorContents();
        let images = toJS(props.images) || [];
        if (images.length) {
          const Keys = [];
          for (let i = images.length - 1; i >= 0; i--) {
            const oldImage = images[i];
            const f = editorContents.ops.find(
              (item) =>
                item.insert &&
                item.insert instanceof Object &&
                item.insert.image &&
                item.insert.image === oldImage.url,
            );
            if (!f) {
              Keys.push(oldImage.url);
              images.splice(i, 1);
            }
          }
          if (Keys && Keys.length) {
            try {
              await commonStore.handleApi({
                method: 'POST',
                url: '/file/removeMulti',
                data: {
                  Keys,
                },
              });
            } catch (err) {
              console.log(err.message);
            }
          }
        }

        if (uploadFiles.length) {
          try {
            const formData = new FormData();
            formData.append(
              'uploadUrl',
              props.uploadUrl ? props.uploadUrl : '',
            );
            for (const item of uploadFiles) {
              formData.append('files', item, item.uid);
            }

            const uploadRes = await commonStore.handleApi({
              method: 'POST',
              url: '/file/uploadFile',
              data: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (uploadRes.ok) {
              images = images.concat(uploadRes.data);
              for (const key in replaceEditorBase64) {
                const regExp = new RegExp(key);
                const f = images.find((item) => regExp.test(item.uid));
                if (f) {
                  content = content.replace(replaceEditorBase64[key], f.url);
                }
              }
            }
          } catch (err) {
            commonStore.loading = false;
            return window.alert({ title: err.message });
          }
        }

        commonStore.loading = false;
        resolve([content, images]);
      });
    },
    [quillRef.current, props.uploadUrl],
  );

  useEffect(() => {
    if (props.content) {
      state.content = props.content;
    }
  }, [props.content]);

  useEffect(() => {
    setTimeout(() => {
      props.setPreSave(preSave, props.lang);
    }, 10);
  }, [quillRef.current, props.uploadUrl]);

  const moduleConfig = useMemo(() => {
    return {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [
            { size: ['small', false, 'large', 'huge'] },
            {
              color: [...EDITOR_COLORS, '#55a8f4'],
            },
          ],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
            { align: [] },
          ],
          ['link', 'image', 'video'],
          ['clean'],
        ],
      },
      blotFormatter: {
        specs: [VideoSpec],
      },
      imageDrop: true,
      magicUrl: true,
      clipboard: {
        allowed: {
          tags: [
            'a',
            'b',
            'strong',
            'u',
            's',
            'i',
            'p',
            'br',
            'ul',
            'ol',
            'li',
            'span',
          ],
          attributes: [
            'href',
            'rel',
            'target',
            'class',
            'width',
            'height',
            'style',
            'alt',
            'align',
            'src',
          ],
        },
        keepSelection: true,
      },
      imageUploader: {
        upload: (file) => {
          return new Promise(async (resolve, reject) => {
            if (quillRef && quillRef.current) {
              try {
                const fileReader = new FileReader();
                fileReader.onload = function (reader) {
                  resolve(reader.target.result);
                };
                fileReader.readAsDataURL(file);
              } catch (error) {
                return window.alert({ title: error.message });
              }
            }
          });
        },
      },
      imageCompress: {
        quality: 0.7,
        maxWidth: 1000,
        maxHeight: 2000,
        imageType: 'image/png',
        debug: false,
      },
    };
  }, []);

  useEffect(() => {
    if (props.lang) {
      if (!props.preSave[props.lang]) {
        commonStore.loading = true;
      } else {
        commonStore.loading = false;
      }
    } else {
      if (!props.preSave) {
        commonStore.loading = true;
      } else {
        commonStore.loading = false;
      }
    }
  }, [props]);

  return (
    <>
      <ReactQuill
        ref={quillRef}
        value={state.content}
        onChange={handleChange}
        modules={moduleConfig}
        formats={formats}
      />
    </>
  );
});

export default Editor;
