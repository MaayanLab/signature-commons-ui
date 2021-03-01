// https://malloc.fi/using-google-analytics-with-next-js

import ReactGA from 'react-ga'
import config from './config'

const analytics_code = async () => {
  return (await config()).NEXT_PUBLIC_GA_TRACKING_ID
}

export const initGA = async () => {
  if (process.env.NODE_ENV !== "development"){
    const code = await analytics_code()
    if (code.startsWith('G-')){
      return code
    } else {
      ReactGA.initialize(code)
    }
  }
}

export const logPageView = (pathname, GA_TRACKING_ID=null) => {
  if (process.env.NODE_ENV !== "development"){
    if (GA_TRACKING_ID){
      if (typeof window.gtag !== 'undefined') {
        window.gtag("config", GA_TRACKING_ID, {
          page_location: pathname,
        });
      }
    }else {
      ReactGA.set({ page: pathname })
      ReactGA.pageview(pathname)
    }
  }
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
