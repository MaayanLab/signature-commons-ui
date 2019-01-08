export function range(start, end) {
  if (end === undefined) {
    end = start
    start = 0
  }

  function *_range() {
    for(let i = start; i < end; i++) {
      yield i
    }
  }
  return [..._range()]
}
