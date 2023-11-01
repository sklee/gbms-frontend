import { Quill } from 'react-quill';

// BEGIN allow alignment styles
const FormatAttributesList = [
  'alt',
  'height',
  'width',
  'class',
  'style',
  'align',
  'src',
];

const BaseImageFormat = Quill.import('formats/image');
export class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return FormatAttributesList.reduce(function (formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (FormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

// 직접 조절용
const BaseVideoFormat = Quill.import('formats/video');
export class VideoBase extends BaseVideoFormat {
  static formats(domNode) {
    return FormatAttributesList.reduce(function (formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (FormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

// 고정용 Responsive
const BlockEmbed = Quill.import('blots/block/embed');
const Link = Quill.import('formats/link');
export class VideoFormat extends BlockEmbed {
  static blotName = 'video';
  static tagName = 'div';

  static create(value) {
    const node = super.create(value);
    node.classList.add('ql-video-wrapper');

    const innerChild = document.createElement('div');
    innerChild.classList.add('ql-video-inner');
    node.appendChild(innerChild);

    const child = document.createElement('iframe');
    child.setAttribute('frameborder', '0');
    child.setAttribute('allowfullscreen', true);
    child.setAttribute('src', this.sanitize(value));
    innerChild.appendChild(child);

    return node;
  }

  static sanitize(url) {
    return Link.sanitize(url);
  }

  static value(domNode) {
    const iframe = domNode.querySelector('iframe');
    return iframe ? iframe.getAttribute('src') : '';
  }
}
// END allow alignment styles
