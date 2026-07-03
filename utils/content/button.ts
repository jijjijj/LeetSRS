import { LEETSRS_BUTTON_COLOR, THEME_COLORS } from './constants';
import { getServiceTranslations } from '@/services/i18n';

const LEETSRS_ICON_SVG = `
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img">
      <path d="M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5" />
      <path d="M5.63 7.16l0 .01" />
      <path d="M4.06 11l0 .01" />
      <path d="M4.63 15.1l0 .01" />
      <path d="M7.16 18.37l0 .01" />
      <path d="M11 19.94l0 .01" />
    </svg>
  `;

export function createButton(options: {
  className?: string;
  style?: string;
  innerHTML?: string;
  onClick?: () => void;
}): HTMLButtonElement {
  const button = document.createElement('button');

  if (options.className) {
    button.className = options.className;
  }

  if (options.style) {
    button.style.cssText = options.style;
  }

  if (options.innerHTML) {
    button.innerHTML = options.innerHTML;
  }

  if (options.onClick) {
    button.addEventListener('click', options.onClick);
  }

  return button;
}

/**
 * Button variant for neetcode.io. Unlike createLeetSrsButton, which reuses
 * LeetCode's own Tailwind classes, this is fully inline-styled because
 * NeetCode's stylesheets don't define those classes.
 */
export function createNeetcodeSrsButton(onClick: () => void, isDark: () => boolean): HTMLDivElement {
  const t = getServiceTranslations();
  const buttonWrapper = document.createElement('div');
  buttonWrapper.style.cssText = 'position: relative; display: inline-flex; vertical-align: middle;';

  const colors = isDark() ? THEME_COLORS.dark : THEME_COLORS.light;

  const clickableDiv = document.createElement('div');
  clickableDiv.setAttribute('title', t.app.name);
  clickableDiv.setAttribute('aria-label', t.app.name);
  clickableDiv.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    color: ${LEETSRS_BUTTON_COLOR};
    background-color: ${colors.bgAddButton};
    transition: background-color 0.2s;
  `;
  clickableDiv.innerHTML = LEETSRS_ICON_SVG;

  clickableDiv.addEventListener('mouseenter', () => {
    clickableDiv.style.backgroundColor = colors.bgAddButtonHover;
  });
  clickableDiv.addEventListener('mouseleave', () => {
    clickableDiv.style.backgroundColor = colors.bgAddButton;
  });
  clickableDiv.addEventListener('click', onClick);

  buttonWrapper.appendChild(clickableDiv);
  return buttonWrapper;
}

export function createLeetSrsButton(onClick: () => void): HTMLDivElement {
  const t = getServiceTranslations();
  const buttonWrapper = document.createElement('div');
  buttonWrapper.className = 'relative flex';

  const innerWrapper = document.createElement('div');
  innerWrapper.className = 'relative flex overflow-hidden rounded bg-fill-tertiary dark:bg-fill-tertiary';

  const groupWrapper = document.createElement('div');
  groupWrapper.className =
    'group flex flex-none items-center justify-center hover:bg-fill-quaternary dark:hover:bg-fill-quaternary';

  const clickableDiv = document.createElement('div');
  clickableDiv.className = 'flex cursor-pointer p-2';
  clickableDiv.setAttribute('data-state', 'closed');
  clickableDiv.setAttribute('title', t.app.name);
  clickableDiv.setAttribute('aria-label', t.app.name);

  // Use inline style for the LeetSRS button color
  clickableDiv.style.color = LEETSRS_BUTTON_COLOR;

  clickableDiv.innerHTML = `
    <div class="relative text-[16px] leading-[normal] before:block before:h-4 before:w-4">
      <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-1/2 top-1/2 h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em]" role="img">
        <path d="M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5" />
        <path d="M5.63 7.16l0 .01" />
        <path d="M4.06 11l0 .01" />
        <path d="M4.63 15.1l0 .01" />
        <path d="M7.16 18.37l0 .01" />
        <path d="M11 19.94l0 .01" />
      </svg>
    </div>
  `;

  clickableDiv.addEventListener('click', onClick);

  groupWrapper.appendChild(clickableDiv);
  innerWrapper.appendChild(groupWrapper);
  buttonWrapper.appendChild(innerWrapper);

  return buttonWrapper;
}
