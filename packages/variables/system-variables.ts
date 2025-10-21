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
]
