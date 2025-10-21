import { extendTheme } from '@chakra-ui/react'
import { Icon } from '../components/ui/atoms/icon/style'
import { Alert } from '../components/ui/atoms/alert/style'
import { Input } from '../components/ui/atoms/input/style'
import { InputNumber as NumberInput } from '../components/ui/atoms/input-number/style'
import { Select } from '../components/ui/atoms/select/style'
import { Menu } from '../components/ui/atoms/menu/style'
import { Button } from '../components/ui/atoms/button/style'
import { Switch } from '../components/ui/atoms/switch/style'
import { Tag } from '../components/ui/atoms/tag/style'
import { IconButton } from '../components/ui/atoms/icon-button/style'
import { Box } from '../components/ui/atoms/box/style'
import { Table } from '../components/ui/atoms/table/style'
import { StepIndicator } from '../components/ui/atoms/step-indicator/style'
import { StepSeparator } from '../components/ui/atoms/step-separator/style'
import { Textarea } from '../components/ui/molecules/textarea/style'
import { Accordion } from '../components/ui/organisms/accordion/style'
import { Modal } from '../components/ui/organism/modal/style'
import { Popover } from '../components/ui/organism/popover/style'
import { Tooltip } from '../components/ui/organism/tooltip/style'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const semanticTokens = {
  colors: {
    green: {
      50: {
        default: '#E1FFF0',
        _dark: '#003E1E',
      },
      100: {
        default: '#C3FFE0',
        _dark: '#00622F',
      },
      200: {
        default: '#86FFC0',
        _dark: '#008640',
      },
      300: {
        default: '#48FFA0',
        _dark: '#0BFF80',
      },
      400: {
        default: '#0BFF80',
        _dark: '#00CD62',
      },
      500: {
        default: '#00CD62',
        _dark: '#00CD62',
      },
      600: {
        default: '#00A951',
        _dark: '#0BFF80',
      },
      700: {
        default: '#008640',
        _dark: '#008640',
      },
      800: {
        default: '#00622F',
        _dark: '#00622F',
      },
      900: {
        default: '#003E1E',
        _dark: '#003E1E',
      },
    },
    red: {
      50: {
        default: '#FFE1E1',
        _dark: '#3E0000',
      },
      100: {
        default: '#FFC3C3',
        _dark: '#620000',
      },
      200: {
        default: '#FF8686',
        _dark: '#860000',
      },
      300: {
        default: '#FF4848',
        _dark: '#A90000',
      },
      400: {
        default: '#FF0B0B',
        _dark: '#CD0000',
      },
      500: {
        default: '#CD0000',
        _dark: '#FF0B0B',
      },
      600: {
        default: '#A90000',
        _dark: '#FF4848',
      },
      700: {
        default: '#860000',
        _dark: '#FF8686',
      },
      800: {
        default: '#620000',
        _dark: '#FFC3C3',
      },
      900: {
        default: '#3E0000',
        _dark: '#FFE1E1',
      },
    },
    lightBlue: {
      50: {
        default: '#E5F0FF',
        _dark: '#001633',
      },
      100: {
        default: '#CCE2FF',
        _dark: '#002B66',
      },
      200: {
        default: '#99C4FF',
        _dark: '#004199',
      },
      300: {
        default: '#66A7FF',
        _dark: '#0056CC',
      },
      400: {
        default: '#3389FF',
        _dark: '#006CFF',
      },
      500: {
        default: '#006CFF',
        _dark: '#3389FF',
      },
      600: {
        default: '#0056CC',
        _dark: '#66A7FF',
      },
      700: {
        default: '#004199',
        _dark: '#99C4FF',
      },
      800: {
        default: '#002B66',
        _dark: '#CCE2FF',
      },
      900: {
        default: '#001633',
        _dark: '#E5F0FF',
      },
    },
    gray: {
      50: {
        default: '#F7F7F7',
        _dark: '#0D0D0D',
      },
      100: {
        default: '#E1E1E1',
        _dark: '#262626',
      },
      200: {
        default: '#C3C3C3',
        _dark: '#404040',
      },
      300: {
        default: '#A6A6A6',
        _dark: '#595959',
      },
      400: {
        default: '#8C8C8C',
        _dark: '#737373',
      },
      500: {
        default: '#737373',
        _dark: '#8C8C8C',
      },
      600: {
        default: '#595959',
        _dark: '#A6A6A6',
      },
      700: {
        default: '#404040',
        _dark: '#C3C3C3',
      },
      800: {
        default: '#262626',
        _dark: '#E1E1E1',
      },
      900: {
        default: '#F7F7F7',
        _dark: '#0D0D0D',
      },
    },
    yellow: {
      200: '#ffeb3b33',
      500: '#FFEB3B',
    },
    text: {
      normal: {
        default: '#000000',
        _dark: '#ffffff',
      },
      light: {
        default: 'rgba(0, 0, 0, 0.6)',
        _dark: 'rgba(255, 255, 255, 0.7)',
      },
      lighter: {
        default: 'rgba(0, 0, 0, 0.38)',
        _dark: 'rgba(255, 255, 255, 0.38)',
      },
      premium: {
        default: 'orange.500',
        _dark: 'orange.400',
      },
    },
    bg: {
      normal: {
        default: '#ffffff',
        _dark: '#121212',
      },
      dark: {
        default: '#F5F5F5',
        _dark: '#262626',
      },
      darken: {
        default: '#121212',
        _dark: '#ffffff',
      },
      alt: {
        default: '#C3C3C3',
        _dark: '#404040',
      },
      editor: {
        default: `
    var(--chakra-colors-bg-dark) radial-gradient(
      circle,
      rgba(0, 0, 0, 0.05) calc(2px * var(--scale, 1)),
      transparent 1px
    )
    -19px -19px / calc(30px * var(--scale, 1)) calc(30px * var(--scale, 1))
  `,
        _dark: `
    var(--chakra-colors-bg-dark) radial-gradient(
      circle,
      rgba(255, 255, 255, 0.05) calc(2px * var(--scale, 1)),
      transparent 1px
    )
    -19px -19px / calc(30px * var(--scale, 1)) calc(30px * var(--scale, 1)) `,
      }
    },
    divider: {
      normal: {
        default: 'rgba(0,0,0,0.24)',
        _dark: 'rgba(255,255,255,0.36)',
      },
      light: {
        default: 'rgba(0,0,0,0.12)',
        _dark: 'rgba(255,255,255,0.24)',
      },
      lighter: {
        default: 'rgba(0,0,0,0.08)',
        _dark: 'rgba(255,255,255,0.12)',
      },
      subtle: {
        default: 'rgba(0,0,0,0.04)',
        _dark: 'rgba(255,255,255,0.08)',
      },
    },
    brand: {
      primary: {
        default: 'green.500',
        _dark: 'green.400',
      },
      dark: {
        default: 'green.600',
        _dark: 'green.500',
      },
      grey: {
        default: 'gray.500',
        _dark: 'gray.400',
      },
      blue: {
        default: 'blue.400',
        _dark: 'blue.400',
      },
      purple: {
        default: 'purple.500',
        _dark: 'purple.400',
      },
      premium: {
        default: 'orange',
        _dark: 'orange.400',
      },
    },
    alert: {
      info: {
        bg: {
          default: 'blue.50',
          _dark: 'blue.900',
        },
        color: {
          default: '#00B5D8',
          _dark: '#76E4F7',
        },
      },
      warning: {
        bg: {
          default: 'yellow.200',
          _dark: 'yellow.500',
        },
        color: {
          default: 'yellow.500',
          _dark: 'yellow.200',
        },
      },
      error: {
        bg: {
          default: 'red.50',
          _dark: 'red.900',
        },
        color: {
          default: 'red.500',
          _dark: 'red.300',
        },
      },
      success: {
        bg: {
          default: 'green.50',
          _dark: 'green.900',
        },
        color: {
          default: 'green.500',
          _dark: 'green.300',
        },
      },
      premium: {
        bg: {
          default: 'orange.100',
          _dark: 'orange.900',
        },
        color: {
          default: 'orange.500',
          _dark: 'orange.300',
        },
      },
    },
  },
}

export const theme = extendTheme({
  config,
  semanticTokens,
  styles: {
    global: {
      body: {
        bg: 'bg.normal',
        color: 'text.normal',
      },
    },
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
  components: {
    Alert,
    Icon,
    Input,
    NumberInput,
    Menu,
    Button,
    Select,
    Switch,
    Textarea,
    Table,
    Accordion,
    Modal,
    Tooltip,
    Popover,
    Tag,
    IconButton,
    Box,
    StepIndicator,
    StepSeparator,
  },
})
