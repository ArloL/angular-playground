export function customParseFloat(str: string) {
  if (str === '') {
    return 0;
  }
  const commas = (str.match(/,/g) || []).length;
  if (commas === 1) {
    str = str.replace(',', '.');
  } else if (commas > 1) {
    str = str.replaceAll(',', '');
  }
  const dots = (str.match(/\./g) || []).length;
  if (dots > 1) {
    str = str.replace('.', '');
  }
  return Math.round(Number.parseFloat(str) * 100);
}
