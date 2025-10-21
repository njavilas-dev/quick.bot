export const validateResetPasswordToken = async (token: string): Promise<boolean> => {
  if (!token) {
    return false
  }

  try {
    const res = await fetch('/api/auth/credentials/validate-reset-password-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    return res.status === 201
  } catch (error) {
    console.error(error)
    return false
  }
}
