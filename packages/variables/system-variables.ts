import { Variable } from './types'

export const systemVariables: Variable[] = [
  {
    id: 'system_platform',
    name: 'Platform',
    isSystemVariable: true,
    isSavedVariable: false,
    isSecretVariable: false,
    value: '',
  },
  {
    id: 'system_whatsapp_number',
    name: 'WhatsApp Number',
    isSystemVariable: true,
    isSavedVariable: false,
    isSecretVariable: false,
    value: '',
  },
  {
    id: 'system_device',
    name: 'Device type',
    isSystemVariable: true,
    isSavedVariable: false,
    isSecretVariable: false,
    value: '',
  },
  {
    id: 'system_randomId',
    name: 'Random ID',
    isSystemVariable: true,
    value: '',
  },
  {
    id: 'system_today',
    name: 'Today',
    isSystemVariable: true,
    value: '',
  },
  {
    id: 'system_now',
    name: 'Now',
    isSystemVariable: true,
    value: '',
  },
  {
    id: 'system_tomorrow',
    name: 'Tomorrow',
    isSystemVariable: true,
    value: '',
  },
  {
    id: 'system_momentOfTheDay',
    name: 'Moment of the day',
    isSystemVariable: true,
    value: '',
  },
  {
    id: 'system_yesterday',
    name: 'Yesterday',
    isSystemVariable: true,
    value: '',
  },
  {
    id: 'system_whatsapp_name',
    name: 'Contact Name',
    isSystemVariable: true,
    value: '',
  },
  {
    id: 'system_conversation',
    name: 'Conversation',
    isSystemVariable: true,
    isSavedVariable: false,
    isSecretVariable: false,
    value: '',
  },
]
