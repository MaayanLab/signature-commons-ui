export function get_formated_query(terms) {
  if (Array.isArray(terms)) {
    if (terms.length === 0) {
      return ''
    }
    return `?q=${terms.join('%26')}`
  } else if (typeof terms === 'string') {
    return `?q=${terms}`
  } else {
    return `?q=${Object.keys(terms).join('%26')}`
  }
}
