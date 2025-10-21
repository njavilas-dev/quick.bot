export const getDowngradeStatus = (
  currentPlanPrice: number | undefined,
  planPrice: number
): boolean => {
  return (currentPlanPrice || 0) > planPrice
}