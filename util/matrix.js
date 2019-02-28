export function slice(left, right) {
  return {
    left,
    right,
  }
}

export function resolve_slice(s, l) {
  if (s === null) {
    return slice(0, l)
  } else if (typeof s === 'number') {
    if (s < 0) {
      return slice(l + s, l + s + 1)
    } else {
      return slice(s, s + 1)
    }
  } else if (typeof s === 'object') {
    return {
      left: s.left === null ? 0 : resolve_slice(s.left, l).left,
      right: s.right === null ? l : resolve_slice(s.right, l).left,
    }
  }
}

export function matrix_slice(M, X_slice, Y_slice) {
  const X = resolve_slice(X_slice, M[0].length)
  const Y = resolve_slice(Y_slice, M.length)

  let j = 0
  let M_ = Array(Y.right - Y.left)
  for (let y = Y.left; y < Y.right; y++) {
    let i = 0
    M_[j] = Array(X.right - X.left)
    for (let x = X.left; x < X.right; x++) {
      M_[j][i] = M[y][x]
      i++
    }
    j++
  }
  return M_
}

export function matrix_flatten(M) {
  const X = M[0].length
  const Y = M.length

  let i = 0
  let M_ = Array(X * Y)
  for (let y = 0; y < Y; y++) {
    for (let x = 0; x < X; x++) {
      M_[i++] = M[y][x]
    }
  }

  return M_
}

export function matrix_transpose(M) {
  const X = M[0].length
  const Y = M.length

  let j = 0
  let M_ = Array(X)
  for (let y = 0; y < Y; y++) {
    let i = 0
    M_[j] = Array(Y)
    for (let x = 0; x < X; x++) {
      M_[j][i] = M[x][y]
      i++
    }
    j++
  }

  return M_
}
