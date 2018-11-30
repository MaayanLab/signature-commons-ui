export function range(n) {
  function *_range(n) {
    for(var i = 0; i < n; i++) {
      yield n
    }
  }
  return [..._range(n)]
}