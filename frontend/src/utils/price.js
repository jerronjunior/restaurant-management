export const getNumericPrice = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const formatPriceLabel = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.toUpperCase().startsWith('LKR')) {
      return trimmed;
    }
    const numeric = getNumericPrice(trimmed);
    return `LKR ${numeric.toLocaleString()}`;
  }

  const numeric = getNumericPrice(value);
  return `LKR ${numeric.toLocaleString()}`;
};
