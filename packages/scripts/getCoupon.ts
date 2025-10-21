import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const prismaWithLogging = withQueryLogging()

const getCoupon = async () => {
  await promptAndSetEnvironment('production')

  const val = (await p.text({
    message: 'Enter coupon code',
  })) as string

  const coupon = await prismaWithLogging.coupon.findFirst({
    where: {
      code: val,
    },
  })

  if (!coupon) {
    console.log('Coupon not found')
    return
  }

  console.log(JSON.stringify(coupon, null, 2))
}

getCoupon()
