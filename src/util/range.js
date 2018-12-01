export function range(n) {
  function *_range(n) {
    for(let i = 0; i < n; i++) {
      yield i
    }
  }
  return [..._range(n)]
}