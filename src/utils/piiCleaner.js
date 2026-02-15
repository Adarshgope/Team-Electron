// Constraint: PII Masking 
export const cleanDataForLLM = (userProfile, taskInput) => {
  // 1. Identify patterns (simplified regex for demo)
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phonePattern = /\b\d{10}\b/g;
  
  // 2. Mask the user's name if it appears in the task
  const namePattern = new RegExp(userProfile.name, 'gi');

  let cleanedInput = taskInput
    .replace(emailPattern, '[EMAIL_REDACTED]')
    .replace(phonePattern, '[PHONE_REDACTED]');
    
  if (userProfile.name) {
    cleanedInput = cleanedInput.replace(namePattern, '[USER]');
  }

  // Return only the structural preferences, not the identity
  const safeContext = {
    needs: userProfile.preferences.stepGranularity,
    avoid: userProfile.triggers,
    visuals: userProfile.preferences.visualCues
  };

  return { cleanedInput, safeContext };
};