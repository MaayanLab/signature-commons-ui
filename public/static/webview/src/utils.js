function get_dtype(v) {
  if ((v|0) == v) {
    return 'int'
  } else if ((v * 1.0) == v) {
    return 'float'
  } else if (v==='up' || v ==='down') {
    return 'direction'
  } else {
    return 'string'
  }
}

export async function read_tsv(url) {
  const response = await fetch(url)
  const text = await response.text()
  const rows = text.split('\n')
    .filter(line => line.replace(/^\s+|\s+$/g, '') !== '')
    .map(line => line.split('\t'))
  const header = rows.shift()
  if (rows.length === 0) return { header, data: [], dtype: {} }
  const row_0 = rows[0]
  const dtype = {}
  for(let i = 0; i< row_0.length; i++) {
    dtype[header[i]] = get_dtype(row_0[i])
  }
  const data = rows.map((row) => {
    const rowdict = {}
    for (let i = 0; i < row.length; i++) {
      if (dtype[header[i]] === 'int') {
        rowdict[header[i]] = row[i]|0
      } else if (dtype[header[i]] === 'float') {
        rowdict[header[i]] = row[i]*1.0
      } else {
        rowdict[header[i]] = row[i]
      }
    }
    return rowdict
  })
  return { header, data, dtype }
}
