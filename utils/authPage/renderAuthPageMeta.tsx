const renderAuthPageMeta = (
  isLogging: boolean | undefined,
  isRegistering: boolean | undefined,
  isRecovering: boolean | undefined
): string => {
  let description: string = '';

  if (isLogging) description = 'Sign In to your account with your credentials!';
  if (isRegistering) description = 'We are excited to have you join us!';
  if (isRecovering) description = 'In case you forgot your account password, follow the steps!';

  return description;
};

export default renderAuthPageMeta;
