export const parseDeadlineDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const COMPACT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  hourCycle: 'h23',
});

export const getDeadlineTimestamp = (value) => {
  const date = parseDeadlineDate(value);
  return date ? date.getTime() : null;
};

export const formatDeadline = (value, options = {}) => {
  const date = parseDeadlineDate(value);
  if (!date) return null;

  const { compact = false } = options;
  const dateLabel = compact
    ? COMPACT_DATE_FORMATTER.format(date)
    : FULL_DATE_FORMATTER.format(date);

  return `${dateLabel}, ${TIME_FORMATTER.format(date)}`;
};
