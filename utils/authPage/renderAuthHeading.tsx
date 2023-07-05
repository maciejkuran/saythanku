const renderAuthHeading = (
  isLogging: boolean | undefined,
  isRegistering: boolean | undefined,
  isRecovering: boolean | undefined
): string => {
  let heading: string = '';

  if (isLogging) heading = 'Sign In!';
  if (isRegistering) heading = 'Sign Up!';
  if (isRecovering) heading = 'Account Recovery';

  return heading;
};

export default renderAuthHeading;
