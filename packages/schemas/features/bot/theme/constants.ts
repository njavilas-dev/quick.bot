export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export const fontTypes = ['Google', 'Custom'] as const

export const progressBarPlacements = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
]

export const progressBarPositions = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Absolute', value: 'absolute' },
]

export const progressBarPlacementValues = progressBarPlacements.map(p => p.value) as [string, ...string[]]
export const progressBarPositionValues = progressBarPositions.map(p => p.value) as [string, ...string[]]

export const shadows = ['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const

export const borderRoundness = [
  { label: 'None', value: 'none' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
  { label: '10', value: 'custom' },
]

export const borderRoundnessValues = borderRoundness.map(p => p.value) as [string, ...string[]]

export const defaultLightTextColor = '#303235'

/*---- General ----*/

// Font
export const defaultFontType = 'Google'
export const defaultFontFamily = 'Open Sans'

// Background
export const defaultBackgroundType = BackgroundType.COLOR
export const defaultBackgroundColor = '#ffffff'

// Progress bar
export const defaultProgressBarIsEnabled = false
export const defaultProgressBarColor = '#01a952'
export const defaultProgressBarBackgroundColor = '#dffaeb'
export const defaultProgressBarThickness = 4
export const defaultProgressBarPosition = 'absolute'
export const defaultProgressBarPlacement = 'top'

export const defaultRoundness = 'large'
export const defaultOpacity = 1
export const defaultBlur = 0

/*---- Chat ----*/

// Container
export const defaultContainerMaxWidth = '800px'
export const defaultContainerMaxHeight = '100%'
export const defaultContainerBackgroundColor = 'transparent'

// Agent bubbles
export const defaultHostBubblesBackgroundColor = '#f5f5f5'
export const defaultHostBubblesColor = '#202020'

// Agent
export const defaultButtonsBackgroundColor = '#01a952'
export const defaultButtonsColor = '#ffffff'
export const defaultButtonsBorderThickness = 0

// User
export const defaultInputsBackgroundColor = '#FFFFFF'
export const defaultInputsColor = '#202020'
export const defaultInputsPlaceholderColor = '#9095A0'
export const defaultInputsShadow = 'md'

// User bubbles
export const defaultGuestBubblesBackgroundColor = '#dffaeb'
export const defaultGuestBubblesColor = '#1c201f'

// Host avatar
export const defaultHostAvatarIsEnabled = true

// Guest avatar
export const defaultGuestAvatarIsEnabled = false
