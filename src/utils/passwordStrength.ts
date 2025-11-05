export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
}

/**
 * Calculate password strength based on multiple criteria
 * @param password - Password string to evaluate
 * @returns PasswordStrengthResult with strength level, score, and feedback
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: ['Password cannot be empty'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length scoring (max 30 points)
  if (password.length >= 8) {
    score += 10;
  } else {
    feedback.push('Password should be at least 8 characters');
  }

  if (password.length >= 12) {
    score += 10;
  }

  if (password.length >= 16) {
    score += 10;
  }

  // Character variety scoring
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (hasLowercase) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (hasUppercase) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (hasNumbers) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }

  if (hasSymbols) {
    score += 15;
  } else {
    feedback.push('Add special characters');
  }

  // Determine strength based on score
  // Score ranges: 0-35 = weak, 36-59 = medium, 60+ = strong
  let strength: PasswordStrength;
  if (score >= 60) {
    strength = 'strong';
    feedback.push('Strong password!');
  } else if (score >= 36) {
    strength = 'medium';
    feedback.push('Password is medium strength');
  } else {
    strength = 'weak';
    feedback.push('Password is too weak');
  }

  return {
    strength,
    score,
    feedback,
  };
}

/**
 * Get a color representation of password strength
 * @param strength - Password strength level
 * @returns Color string for UI representation
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'strong':
      return '#4CAF50'; // Green
    case 'medium':
      return '#FF9800'; // Orange
    case 'weak':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Gray
  }
}

/**
 * Get a user-friendly label for password strength
 * @param strength - Password strength level
 * @returns User-friendly label string
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'strong':
      return 'Strong';
    case 'medium':
      return 'Medium';
    case 'weak':
      return 'Weak';
    default:
      return 'Unknown';
  }
}
