export function dateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function money(value) {
  return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}
