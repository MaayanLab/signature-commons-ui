import _ from 'underscore'
import * as d3 from 'd3'
/*
 * Utility functions
 */

export function getCanvasColor(color) {
  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')'
}

export const RARE = 'other'

export function getDataType(value) {
  let type = typeof value
  if (type === 'number') {
    type = 'int'
    if (!Number.isInteger(value)) {
      type = 'float'
    }
  }
  return type
}

export function orderArray(arr, indices) {
  // Reorder arr based on indices
  const orderedArr = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    orderedArr[i] = arr[indices[i]]
  }
  return orderedArr
}

export function encodeRareCategories(arr, k) {
  // Count occurrences of each unique categories in arr,
  // then keep top k and encode rare categories as 'rares'
  let counts = _.countBy(arr)
  // sort values
  counts = _.sortBy(_.pairs(counts), tuple => -tuple[1])
  // get top k frequent categories
  const frequentCategories = _.map(counts.slice(0, k), tuple => tuple[0])
  for (let i = 0; i < arr.length; i++) {
    if (frequentCategories.indexOf(arr[i]) === -1) {
      arr[i] = RARE
    }
  }
  return arr
}

export function binValues(arr, nbins) {
  // Binning continues array of values in to nbins
  let extent = d3.extent(arr)
  let min = parseFloat(extent[0])
  let max = parseFloat(extent[1])
  let interval = (max - min) / nbins // bin width

  let domain = _.range(1, nbins).map(function(i) {
    return i * interval + min
  }) // bin edges
  let labels = [min.toFixed(2) + ' to ' + domain[0].toFixed(2)]

  for (let i = 0; i < nbins - 1; i++) {
    let label
    if (i === nbins - 2) {
      // the last bin
      label = domain[i].toFixed(2) + ' to ' + max.toFixed(2)
    } else {
      label = domain[i].toFixed(2) + ' to ' + domain[i + 1].toFixed(2)
    }
    labels.push(label)
  }
  return {
    labels: labels,
    domain: domain,
    min: min,
    max: max,
    interval: interval
  }
}

export function binValues2(arr, domain) {
  // Binning continues array of values by a given binEdges (domain)
  // domain: [0.001, 0.01, 0.05, 0.1, 1]
  // domain should include the largest (rightest) value
  let extent = d3.extent(arr)
  let min = parseFloat(extent[0])
  let max = parseFloat(extent[1])

  let labels = ['0 to ' + domain[0]]
  let nbins = domain.length

  for (let i = 0; i < nbins - 1; i++) {
    let label = domain[i] + ' to ' + domain[i + 1]
    labels.push(label)
  }
  return { labels: labels, domain: domain.slice(0, -1), min: min, max: max }
}

export function binBy(list, key, nbins) {
  // similar to _.groupBy but applying to continues values using `binValues`
  // list: an array of objects
  // key: name of the continues letiable
  // nbins: number of bins
  let values = _.pluck(list, key)
  let binnedValues = binValues(values, nbins)
  let labels = binnedValues.labels
  let min = binnedValues.min
  let interval = binnedValues.interval

  let grouped = _.groupBy(list, function(obj) {
    let i = Math.floor((obj[key] - min) / interval)
    if (i === nbins) {
      // the max value
      i = nbins - 1
    }
    return labels[i]
  })
  return grouped
}

export function binBy2(list, key, domain) {
  // wrapper for `binValuesBy`
  let values = _.pluck(list, key)
  let binnedValues = binValues2(values, domain)
  let labels = binnedValues.labels

  let grouped = _.groupBy(list, function(obj) {
    let i = _.filter(domain, function(edge) {
      return edge < obj[key]
    }).length
    return labels[i]
  })
  return grouped
}
