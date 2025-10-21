import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const prismaWithLogging = withQueryLogging()

const redeemCoupon = async () => {
  await promptAndSetEnvironment('production')

  const code = await p.text({
    message: 'Coupon code?',
  })

  if (!code || p.isCancel(code)) process.exit()

  const coupon = await prismaWithLogging.coupon.update({
    where: {
      code,
    },
    data: {
      dateRedeemedAt: new Date(),
    },
  })

  console.log(coupon)
}

redeemCoupon()
