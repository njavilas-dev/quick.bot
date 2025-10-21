import { useWorkspace } from '@/hooks/useWorkspace'
import { BoxCard, H2 } from '@urbiport/ui'
import { useBillingFormFields } from './BillingFormFields'

const BillingInfo = () => {
  const { workspace } = useWorkspace()

  const { renderBillingFields } = useBillingFormFields()

  if (!workspace) {
    return null
  }

  return (
    <BoxCard>
      <H2>Information</H2>
      {renderBillingFields()}
    </BoxCard>
  )
}

export default BillingInfo
