export function validURL(str) {
    try {
      new URL(str)
    } catch {
      return false
    }
    return true
  }