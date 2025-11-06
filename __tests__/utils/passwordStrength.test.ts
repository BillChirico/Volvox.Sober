import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  PasswordStrength,
} from '../../src/utils/passwordStrength';

describe('Password Strength Utilities', () => {
  describe('calculatePasswordStrength', () => {
    describe('Weak passwords', () => {
      it('should return weak for empty password', () => {
        const result = calculatePasswordStrength('');
        expect(result.strength).toBe('weak');
        expect(result.score).toBe(0);
        expect(result.feedback).toContain('Password cannot be empty');
      });

      it('should return weak for password with only letters', () => {
        const result = calculatePasswordStrength('abcdefgh');
        expect(result.strength).toBe('weak');
        // Only gets 10 points for length, 15 for lowercase = 25 (weak)
        expect(result.score).toBeLessThan(36);
      });

      it('should return weak for password with insufficient score', () => {
        const result = calculatePasswordStrength('abc');
        expect(result.strength).toBe('weak');
        // 0 (too short) + 15 (lower) = 15 (weak)
        expect(result.score).toBeLessThan(36);
        expect(result.feedback).toContain('Password should be at least 8 characters');
      });
    });

    describe('Medium passwords', () => {
      it('should return medium for 8-char password with 3 character types', () => {
        const result = calculatePasswordStrength('password123');
        expect(result.strength).toBe('medium');
        // 10 (length) + 15 (lower) + 15 (numbers) = 40 (medium)
        expect(result.score).toBeGreaterThanOrEqual(36);
        expect(result.score).toBeLessThan(60);
      });

      it('should return medium for password missing one character type', () => {
        const result = calculatePasswordStrength('Password!');
        expect(result.strength).toBe('medium');
        // 10 (length) + 15 (lower) + 15 (upper) + 15 (symbols) = 55 (medium)
        expect(result.score).toBeGreaterThanOrEqual(36);
        expect(result.score).toBeLessThan(60);
      });
    });

    describe('Strong passwords', () => {
      it('should return strong for 12+ char password with all types', () => {
        const result = calculatePasswordStrength('Password123!');
        expect(result.strength).toBe('strong');
        // 20 (length >=12) + 15*4 (all types) = 80 (strong)
        expect(result.score).toBeGreaterThanOrEqual(60);
        expect(result.feedback).toContain('Strong password!');
      });

      it('should return strong for 16+ character password with variety', () => {
        const result = calculatePasswordStrength('VeryStrongPass123!');
        expect(result.strength).toBe('strong');
        // 30 (length >=16) + 15*4 (all types) = 90 (strong)
        expect(result.score).toBeGreaterThanOrEqual(60);
      });

      it('should return strong for complex password', () => {
        const result = calculatePasswordStrength('C0mpl3x!P@ssw0rd#2024');
        expect(result.strength).toBe('strong');
        expect(result.score).toBeGreaterThanOrEqual(60);
      });
    });

    describe('Score calculation', () => {
      it('should give higher score for longer passwords', () => {
        const short = calculatePasswordStrength('Pass123!');
        const medium = calculatePasswordStrength('Password123!');
        const long = calculatePasswordStrength('VeryLongPassword123!');

        expect(long.score).toBeGreaterThan(medium.score);
        expect(medium.score).toBeGreaterThan(short.score);
      });

      it('should give higher score for more character variety', () => {
        const twoTypes = calculatePasswordStrength('password123');
        const threeTypes = calculatePasswordStrength('Password123');
        const fourTypes = calculatePasswordStrength('Password123!');

        expect(fourTypes.score).toBeGreaterThan(threeTypes.score);
        expect(threeTypes.score).toBeGreaterThan(twoTypes.score);
      });
    });

    describe('Edge cases', () => {
      it('should handle password with multiple special characters', () => {
        const result = calculatePasswordStrength('Pass123!@#$%');
        expect(result.strength).not.toBe('weak');
      });

      it('should handle password with spaces', () => {
        const result = calculatePasswordStrength('Pass word 123!');
        expect(result.strength).not.toBe('weak');
      });

      it('should handle very long password', () => {
        const longPass = 'VeryLongPassword123!' + 'a'.repeat(50);
        const result = calculatePasswordStrength(longPass);
        expect(result.strength).toBe('strong');
      });

      it('should handle unicode characters', () => {
        const result = calculatePasswordStrength('Pássw0rd!123');
        expect(result.score).toBeGreaterThan(0);
      });
    });

    describe('Feedback messages', () => {
      it('should provide specific feedback for missing requirements', () => {
        const result = calculatePasswordStrength('password');
        expect(result.feedback.length).toBeGreaterThan(1);
        expect(result.feedback.some(f => f.includes('uppercase'))).toBe(true);
        expect(result.feedback.some(f => f.includes('numbers'))).toBe(true);
        expect(result.feedback.some(f => f.includes('special'))).toBe(true);
      });

      it('should provide positive feedback for strong password', () => {
        const result = calculatePasswordStrength('VeryStrongPassword123!');
        expect(result.feedback).toContain('Strong password!');
      });

      it('should provide appropriate feedback for medium password', () => {
        const result = calculatePasswordStrength('password123');
        expect(result.feedback).toContain('Password is medium strength');
      });
    });
  });

  describe('getPasswordStrengthColor', () => {
    it('should return green for strong password', () => {
      const color = getPasswordStrengthColor('strong');
      expect(color).toBe('#4CAF50');
    });

    it('should return orange for medium password', () => {
      const color = getPasswordStrengthColor('medium');
      expect(color).toBe('#FF9800');
    });

    it('should return red for weak password', () => {
      const color = getPasswordStrengthColor('weak');
      expect(color).toBe('#F44336');
    });

    it('should return gray for unknown strength', () => {
      const color = getPasswordStrengthColor('unknown' as PasswordStrength);
      expect(color).toBe('#9E9E9E');
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('should return Strong for strong password', () => {
      const label = getPasswordStrengthLabel('strong');
      expect(label).toBe('Strong');
    });

    it('should return Medium for medium password', () => {
      const label = getPasswordStrengthLabel('medium');
      expect(label).toBe('Medium');
    });

    it('should return Weak for weak password', () => {
      const label = getPasswordStrengthLabel('weak');
      expect(label).toBe('Weak');
    });

    it('should return Unknown for invalid strength', () => {
      const label = getPasswordStrengthLabel('invalid' as PasswordStrength);
      expect(label).toBe('Unknown');
    });
  });
});
