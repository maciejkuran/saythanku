const formatDateShort = (date: Date) => {
  const newDate = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('pl-PL', options).format(newDate);
};

export default formatDateShort;
