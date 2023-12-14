'use strict';

// sanitize user-Input to be Desktop-Filename safe
export function sanitizeForDesktop(str: string): string {
  const map: { [key: string]: string } = {
    '/': '',
    '\\': '',
    ':': '',
    '*': '',
    '?': '',
    '"': '',
    '<': '',
    '>': '',
    '|': '',
  };
  const reg = /[/\\:*?"<>|]/gi;
  return str ? str.replace(reg, (match) => map[match]) : '';
}

export function sanitizeIconName(name: string): string {
  const map: { [key: string]: string } = {
    '/': '',
    '\\': '',
    ':': '',
    '*': '',
    '?': '',
    '"': '',
    '<': '',
    '>': '',
    '|': '',
    '(': '',
    ')': '',
    ' ': '-',
    '.': '_',
  };
  const reg = /[/\\:*?"<>|() .]/gi;
  return name
    ? name.replace(reg, (match) => {
        return map[match];
      })
    : '';
}

export function restoreTitleFromFileName(
  filename: string,
  isSVG: boolean
): string {
  let title;

  const domainStoryRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?(.dst|.egn)/;
  const svgRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?(.dst|.egn).svg/;

  const egnSuffix = '.egn';
  const dstSuffix = '.dst';
  const svgSuffix = '.svg';

  let filenameWithoutDateSuffix = filename.replace(
    isSVG ? svgRegex : domainStoryRegex,
    ''
  );
  if (filenameWithoutDateSuffix.includes(isSVG ? svgSuffix : dstSuffix)) {
    filenameWithoutDateSuffix = filenameWithoutDateSuffix
      .replace(svgSuffix, '')
      .replace(dstSuffix, '')
      .replace(egnSuffix, '');
  }
  title = filenameWithoutDateSuffix;
  return title;
}
