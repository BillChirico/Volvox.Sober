import {
  loginSchema,
  signupSchema,
  passwordResetSchema,
  updatePasswordSchema,
} from '../../src/services/validationSchemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login credentials', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing email', async () => {
      const invalidData = {
        password: 'password123',
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Email is required');
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'notanemail',
        password: 'password123',
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow(
        'Please enter a valid email address',
      );
    });

    it('should reject missing password', async () => {
      const invalidData = {
        email: 'test@example.com',
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Password is required');
    });
  });

  describe('signupSchema', () => {
    it('should validate correct signup data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      await expect(signupSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject password shorter than 8 characters', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
      };

      await expect(signupSchema.validate(invalidData)).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });

    it('should reject password without lowercase letter', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PASSWORD123!',
        confirmPassword: 'PASSWORD123!',
      };

      await expect(signupSchema.validate(invalidData)).rejects.toThrow(
        'Password must contain at least one lowercase letter',
      );
    });

    it('should reject password without uppercase letter', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123!',
        confirmPassword: 'password123!',
      };

      await expect(signupSchema.validate(invalidData)).rejects.toThrow(
        'Password must contain at least one uppercase letter',
      );
    });

    it('should reject password without number', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password!',
        confirmPassword: 'Password!',
      };

      await expect(signupSchema.validate(invalidData)).rejects.toThrow(
        'Password must contain at least one number',
      );
    });

    it('should reject password without special character', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      await expect(signupSchema.validate(invalidData)).rejects.toThrow(
        'Password must contain at least one special character',
      );
    });

    it('should reject mismatched passwords', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(signupSchema.validate(invalidData)).rejects.toThrow('Passwords must match');
    });

    it('should reject missing confirmPassword', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(signupSchema.validate(invalidData)).rejects.toThrow(
        'Please confirm your password',
      );
    });
  });

  describe('passwordResetSchema', () => {
    it('should validate correct email', async () => {
      const validData = {
        email: 'test@example.com',
      };

      await expect(passwordResetSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing email', async () => {
      const invalidData = {};

      await expect(passwordResetSchema.validate(invalidData)).rejects.toThrow('Email is required');
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'notanemail',
      };

      await expect(passwordResetSchema.validate(invalidData)).rejects.toThrow(
        'Please enter a valid email address',
      );
    });
  });

  describe('updatePasswordSchema', () => {
    it('should validate correct password update data', async () => {
      const validData = {
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!',
      };

      await expect(updatePasswordSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject weak new password', async () => {
      const invalidData = {
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      };

      await expect(updatePasswordSchema.validate(invalidData)).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });

    it('should reject mismatched new passwords', async () => {
      const invalidData = {
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'DifferentPassword123!',
      };

      await expect(updatePasswordSchema.validate(invalidData)).rejects.toThrow(
        'Passwords must match',
      );
    });

    it('should reject missing confirmNewPassword', async () => {
      const invalidData = {
        newPassword: 'NewPassword123!',
      };

      await expect(updatePasswordSchema.validate(invalidData)).rejects.toThrow(
        'Please confirm your new password',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with special characters', async () => {
      const validData = {
        email: 'test+alias@example.co.uk',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      await expect(signupSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should handle password with all special character types', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'Pass123!@#$%^&*()',
        confirmPassword: 'Pass123!@#$%^&*()',
      };

      await expect(signupSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should handle very long but valid password', async () => {
      const longPassword = 'VeryLongPassword123!' + 'a'.repeat(50);
      const validData = {
        email: 'test@example.com',
        password: longPassword,
        confirmPassword: longPassword,
      };

      await expect(signupSchema.validate(validData)).resolves.toEqual(validData);
    });
  });
});
