import { matrix_flatten, matrix_slice, slice } from './matrix'
import { range } from './range'

export function count_first_na(L) {
  for (let i = 0; i < L.length; i++) {
    if (L[i] != null)
      return i
  }
  throw new Error('NaNs not identified')
}

export function dictzip(header, data) {
  const D = {}
  for (let i = 0; i < Math.min(header.length, data.length); i++)
    D[header[i]] = data[i]
  return D
}

export function *parse(matrix) {
  const border_x = count_first_na(matrix[0])
  const border_y = count_first_na(matrix_flatten(matrix_slice(matrix, 0, null)))

  if (border_y <= 0 || border_x <= 0)
    throw new Error('Invalid formatting')

  const header_x = matrix_flatten(matrix_slice(matrix, border_x, slice(null, border_y + 1)))
  const header_y = matrix_flatten(matrix_slice(matrix, slice(null, border_x + 1), border_y))

  for (const y of range(border_y + 1, matrix.length)) {
    for (const x of range(border_x + 1, matrix[0].length)) {
      yield {
        'meta': {
          ...dictzip(
            header_x,
            matrix_flatten(matrix_slice(matrix, x, slice(null, border_y + 1)))
          ),
          ...dictzip(
            header_y,
            matrix_flatten(matrix_slice(matrix, slice(null, border_x + 1), y))
          ),
        },
        'data': matrix[y][x],
      }
    }
  }
}

export function parse_csv(data) {
  const lines_re = /[\n\r]/
  const line_re = /(^(("([^"]*)")|([^,]*)),)|((("([^"]*)")|([^,]*)),)|((("([^"]+)")|([^,]+))$)/g

  function *parse_line(line) {
    let m
    while (m = line_re.exec(line)) {
      let r =
           m[2] || m[7] || m[12]
      try {
        r = JSON.parse(r)
      } catch(e) {}

      if (r === undefined || r.length === 0) {
        yield null
      } else {
        yield r
      }
    }
    if (line[line.length - 1] === ',') {
      yield null
    }
  }

  function *parse_lines(lines) {
    for (const line of lines) {
      yield [...parse_line(line)]
    }
  }

  return [...parse_lines(data.split(lines_re))]
}

export function parse_file(data) {
  return parse(parse_csv(data))
}
