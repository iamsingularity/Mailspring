import React from 'react';

import {
  BuildToggleButton,
  BuildColorPicker,
  BuildFontPicker,
  hasMark,
} from './toolbar-component-factories';

const DEFAULT_FONT_SIZE = '12pt';

function sanitizeFontSize(size) {
  if (size.endsWith('px')) {
    return `${Math.round(size.replace('px', '') / 1 * 0.75)}pt`;
  }
  if (size.endsWith('em')) {
    const defaultPts = DEFAULT_FONT_SIZE.replace('pt', '') / 1;
    return `${Math.round(size.replace('em', '') / 1 * defaultPts)}pt`;
  }
  return size;
}

export const MARK_CONFIG = {
  bold: {
    type: 'bold',
    tagNames: ['b', 'strong'],
    hotkey: 'b',
    render: props => <strong>{props.children}</strong>,
    button: {
      isActive: value => hasMark(value, MARK_CONFIG.bold.type),
      onToggle: value => value.change().toggleMark(MARK_CONFIG.bold.type),
      iconClass: 'fa fa-bold',
    },
  },
  italic: {
    type: 'italic',
    tagNames: ['em', 'i'],
    hotkey: 'i',
    render: props => <em>{props.children}</em>,
    button: {
      isActive: value => hasMark(value, MARK_CONFIG.italic.type),
      onToggle: value => value.change().toggleMark(MARK_CONFIG.italic.type),
      iconClass: 'fa fa-italic',
    },
  },
  underline: {
    type: 'underline',
    tagNames: ['u'],
    hotkey: 'u',
    render: props => <u>{props.children}</u>,
    button: {
      isActive: value => hasMark(value, MARK_CONFIG.underline.type),
      onToggle: value => value.change().toggleMark(MARK_CONFIG.underline.type),
      iconClass: 'fa fa-underline',
    },
  },

  strike: {
    type: 'strike',
    tagNames: ['strike', 's', 'del'],
    render: props => <strike>{props.children}</strike>,
    button: {
      isActive: value => hasMark(value, MARK_CONFIG.strike.type),
      onToggle: value => value.change().toggleMark(MARK_CONFIG.strike.type),
      iconClass: 'fa fa-strikethrough',
    },
  },

  codeInline: {
    type: 'codeInline',
    tagNames: ['code'],
    render: props => <code>{props.children}</code>,
  },

  color: {
    type: 'color',
    tagNames: [],
    render: ({ children, mark }) => (
      <span style={{ color: mark.data.value || mark.data.get('value') }}>{children}</span>
    ),
  },
  size: {
    type: 'size',
    tagNames: [],
    render: ({ children, mark }) => (
      <span style={{ fontSize: mark.data.value || mark.data.get('value') }}>{children}</span>
    ),
  },
};

function renderMark(props) {
  const config = MARK_CONFIG[props.mark.type];
  return config && config.render(props);
}

function onKeyDown(event, change, editor) {
  if (process.platform === 'darwin' ? event.metaKey : event.ctrlKey) {
    const config = Object.values(MARK_CONFIG).find(({ hotkey }) => event.key === hotkey);
    if (config) {
      change.toggleMark(config.type);
    }
  }
}

const rules = [
  {
    deserialize(el, next) {
      const config = Object.values(MARK_CONFIG).find(m =>
        m.tagNames.includes(el.tagName.toLowerCase())
      );
      if (config) {
        return {
          object: 'mark',
          type: config.type,
          nodes: next(el.childNodes),
        };
      } else if (el.style && el.style.color) {
        return {
          object: 'mark',
          type: 'color',
          nodes: next(el.childNodes),
          data: { value: el.style.color },
        };
      } else if (el.style && el.style.fontSize) {
        return {
          object: 'mark',
          type: 'size',
          nodes: next(el.childNodes),
          data: { value: sanitizeFontSize(el.style.fontSize) },
        };
      }
    },
    serialize(obj, children) {
      if (obj.object !== 'mark') return;
      return renderMark({ mark: obj, children, targetIsHTML: true });
    },
  },
];

export default [
  {
    toolbarComponents: Object.values(MARK_CONFIG)
      .filter(m => m.button)
      .map(BuildToggleButton)
      .concat([
        BuildColorPicker({ type: 'color', default: '#000000' }),
        BuildFontPicker({ type: 'size', default: DEFAULT_FONT_SIZE }),
      ]),
    renderMark,
    onKeyDown,
    rules,
  },
];