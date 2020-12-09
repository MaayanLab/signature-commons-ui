import { darken, getContrastRatio, lighten } from '@material-ui/core/styles/colorManipulator'
import { dark, light } from '@material-ui/core/styles/createPalette'

export const fill_palette = (palette, tonalOffset, contrastThreshold) => {
  if (palette.dark === undefined) {
    palette.dark = darken(palette.main, tonalOffset * 1.5)
  }
  if (palette.light === undefined) {
    palette.light = lighten(palette.main, tonalOffset)
  }
  if (palette.contrastText === undefined) {
    palette.contrastText = getContrastRatio(palette.main, dark.text.primary) >= contrastThreshold
          ? dark.text.primary
          : light.text.primary
  }
  return palette
}
