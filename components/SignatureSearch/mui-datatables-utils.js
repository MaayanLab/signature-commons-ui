// Extracted and modified from https://github.com/gregnb/mui-datatables/blob/master/src/utils.js for tsvs

export function escapeDangerousTSVCharacters(data) {
  if (typeof data === 'string') {
    // Places single quote before the appearance of dangerous characters if they
    // are the first in the data string.
    return data.replace(/\t/g, "\\t");
  }

  return data;
}

export const buildHead = (columns, options) => {
  return (
    columns
      .reduce(
        (soFar, column) =>
          column.download
            ? soFar +
            escapeDangerousTSVCharacters(column.label || column.name) +
            options.downloadOptions.separator
            : soFar,
        '',
      )
      .slice(0, -1) + '\r\n'
  );
};

export const buildBody = (data, columns, options) => {
  if (!data.length) return '';
  return data
    .reduce(
      (soFar, row) =>
        soFar +
        row.data
          .filter((_, index) => columns[index].download)
          .map(columnData => escapeDangerousTSVCharacters(columnData))
          .join(options.downloadOptions.separator) +
        '\r\n',
      '',
    )
    .trim();
};
