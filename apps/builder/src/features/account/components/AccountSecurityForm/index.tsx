import React from 'react'
import {
  Stack,
  Box,
  Text,
  Button,
  Divider,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { BoxCard, H2, FormControl, Switch, InputText, InputPassword } from '@urbiport/ui'
import { LockIcon } from '@urbiport/icons'
import { useUser } from '@/hooks/useUser'
import { useChangeEmail } from '@/features/account/components/useChangeEmail'
import { useNotifySecurity } from '@/features/account/components/useNotifySecurity'
import { useChangePasswordRequest } from '@/features/account/components/useChangePasswordRequest'

export const AccountSecurityForm = () => {
  const { t } = useTranslate()
  const { user } = useUser()

  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModalOpen,
    onClose: onPasswordModalClose,
    requestPasswordChange,
    newPassword,
    confirmPassword,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    isChangePasswordLoading,
    pendingPasswordChangeRequest,
    cancelPasswordChangeRequest,
  } = useChangePasswordRequest()

  const {
    isOpen: isEmailModalOpen,
    onOpen: onEmailModalOpen,
    onClose: onEmailModalClose,
    newEmail,
    setNewEmail,
    handleEmailSubmit,
    isChangeEmailLoading,
    pendingEmailRequest,
  } = useChangeEmail()

  const {
    handleEmailNotificationsToggle,
    handleLoginAlertsToggle,
    emailNotifications,
    loginAlerts,
    isUpdating,
  } = useNotifySecurity()

  return (
    <BoxCard>
      <Box display="flex" flexDirection="column" gap="8px">
        <H2>{t('account.security.title', 'Security')}</H2>
        <Text fontSize="sm" color="text.light">
          {t('account.security.subtitle', 'Manage your account security settings and preferences')}
        </Text>
      </Box>

      <Stack spacing={8} maxWidth="800px">
        <Box>
          <Text
            fontSize="lg"
            fontWeight="semibold"
            mb={4}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <LockIcon />
            {t('account.security.authentication.title', 'Authentication')}
          </Text>

          <Stack spacing={4}>
            <div className="flex flex-col gap-4">
              <FormControl
                direction="row"
                label={t('account.security.authentication.password.label', 'Password')}
              >
                <Button variant="outline" onClick={onPasswordModalOpen}>
                  {t('account.security.authentication.password.button', 'Change Password')}
                </Button>
              </FormControl>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {t(
                  'account.security.authentication.password.description',
                  'Change your account password',
                )}
              </Text>

              {pendingPasswordChangeRequest && (
                <Alert status="info" marginTop={4}>
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      {t(
                        'account.security.authentication.password.modal.pendingPasswordChangeRequest.label',
                        'Pending Password Change Request',
                      )}
                    </Text>
                    <Text fontSize="xs" color="text.light">
                      {t(
                        'account.security.authentication.password.modal.pendingPasswordChangeRequest.description',
                        'A password change request is pending. Please check your email for confirmation.',
                      )}
                    </Text>
                    <Button
                      size="xs"
                      variant="outline"
                      marginTop={2}
                      onClick={cancelPasswordChangeRequest}
                    >
                      {t(
                        'account.security.authentication.password.modal.cancelButton.label',
                        'Cancel Request',
                      )}
                    </Button>
                  </Box>
                </Alert>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <FormControl
                direction="row"
                label={t('account.security.authentication.email.label', 'Email Address')}
              >
                <Button variant="outline" onClick={onEmailModalOpen}>
                  {t('account.security.authentication.email.button', 'Change Email')}
                </Button>
              </FormControl>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {t(
                  'account.security.authentication.email.description',
                  'Change your account email address',
                )}
              </Text>

              {pendingEmailRequest && (
                <Alert status="info" marginTop={4}>
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      {t(
                        'account.security.authentication.email.modal.pendingEmailChangeRequest.label',
                        'Pending Email Change Request',
                      )}
                    </Text>
                    <Text fontSize="xs" color="text.light">
                      {t(
                        'account.security.authentication.email.modal.pendingEmailChangeRequest.description',
                        'A request to change your email to {newEmail} is pending. Please check your email for confirmation.',
                        { newEmail: pendingEmailRequest.newEmail },
                      )}
                    </Text>
                  </Box>
                </Alert>
              )}
            </div>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t('account.security.notifications.title', 'Security Notifications')}
          </Text>

          <Stack spacing={4}>
            <div className="flex flex-col gap-4">
              <FormControl
                direction="row"
                label={t('account.security.notifications.email.label', 'Email Notifications')}
              >
                <Switch
                  defaultValue={emailNotifications}
                  onChange={handleEmailNotificationsToggle}
                  isDisabled={isUpdating}
                />
              </FormControl>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {t(
                  'account.security.notifications.email.description',
                  'Receive security alerts via email',
                )}
              </Text>
            </div>

            <div className="flex flex-col gap-4">
              <FormControl
                direction="row"
                label={t('account.security.notifications.login.label', 'Login Alerts')}
              >
                <Switch
                  defaultValue={loginAlerts}
                  onChange={handleLoginAlertsToggle}
                  isDisabled={isUpdating}
                />
              </FormControl>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {t(
                  'account.security.notifications.login.description',
                  'Get notified when someone logs into your account',
                )}
              </Text>
            </div>
          </Stack>
        </Box>
      </Stack>

      <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('account.security.authentication.password.modal.title', 'Change Password')}
          </ModalHeader>
          <form onSubmit={requestPasswordChange}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl
                  label={t(
                    'account.security.authentication.password.modal.newPassword.label',
                    'New Password',
                  )}
                >
                  <InputPassword
                    defaultValue={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder={t(
                      'account.security.authentication.password.modal.newPassword.placeholder',
                      'Enter new password',
                    )}
                    isRequired
                  />
                </FormControl>
                <FormControl
                  label={t(
                    'account.security.authentication.password.modal.confirmPassword.label',
                    'Confirm New Password',
                  )}
                >
                  <InputPassword
                    defaultValue={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder={t(
                      'account.security.authentication.password.modal.confirmPassword.placeholder',
                      'Confirm new password',
                    )}
                    isRequired
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onPasswordModalClose}>
                {t('account.security.authentication.password.modal.cancelButton.label', 'Cancel')}
              </Button>
              <Button type="submit" isLoading={isChangePasswordLoading}>
                {t(
                  'account.security.authentication.password.modal.changePasswordButton.label',
                  'Change Password',
                )}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEmailModalOpen} onClose={onEmailModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('account.security.authentication.email.modal.title', 'Change Email Address')}
          </ModalHeader>
          <form onSubmit={handleEmailSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl
                  label={t(
                    'account.security.authentication.email.modal.currentEmail.label',
                    'Current Email',
                  )}
                >
                  <InputText
                    value={user?.email || ''}
                    isDisabled
                    placeholder={t(
                      'account.security.authentication.email.modal.currentEmail.placeholder',
                      'Current email address',
                    )}
                  />
                </FormControl>
                <FormControl
                  label={t(
                    'account.security.authentication.email.modal.newEmail.label',
                    'New Email Address',
                  )}
                >
                  <InputText
                    type="email"
                    value={newEmail}
                    onChange={(value) => setNewEmail(value)}
                    placeholder={t(
                      'account.security.authentication.email.modal.newEmail.placeholder',
                      'Enter new email address',
                    )}
                    isRequired
                    validationOptions={{
                      allowInvalidOnChange: true,
                      allowEmpty: true,
                    }}
                  />
                </FormControl>
                {pendingEmailRequest && (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {t(
                          'account.security.authentication.email.modal.pendingEmailChangeRequest.label',
                          'Pending Email Change Request',
                        )}
                      </Text>
                      <Text fontSize="xs" color="text.light">
                        {t(
                          'account.security.authentication.email.modal.pendingEmailChangeRequest.description',
                          'A request to change your email to {newEmail} is pending. Please check your email for confirmation.',
                          { newEmail: pendingEmailRequest.newEmail },
                        )}
                      </Text>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onEmailModalClose}>
                {t('account.security.authentication.email.modal.cancelButton.label', 'Cancel')}
              </Button>
              <Button type="submit" isLoading={isChangeEmailLoading}>
                {t(
                  'account.security.authentication.email.modal.requestEmailChangeButton.label',
                  'Request Email Change',
                )}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </BoxCard>
  )
}
