export function formatNumber(number: number, digits = 2) {
  if (isNaN(number)) {
    number = 0;
  }
  if (number < 0) {
    number = 0;
  }
  return (number / 100).toLocaleString(navigator.language || 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}
