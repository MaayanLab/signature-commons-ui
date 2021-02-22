// https://malloc.fi/using-google-analytics-with-next-js

import ReactGA from 'react-ga'

export const initGA = (code) => {
  ReactGA.initialize(code)
}

export const logPageView = (pathname) => {
  if (pathname === undefined) pathname = window.location.pathname
  ReactGA.set({ page: pathname })
  ReactGA.pageview(pathname)
}

export const logEvent = (category = '', action = '') => {
  if (category && action) {
    ReactGA.event({ category, action })
  }
}

export const logException = (description = '', fatal = false) => {
  if (description) {
    ReactGA.exception({ description, fatal })
  }
}
