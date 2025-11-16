/**
 * Tests for EARSValidator
 */

import { describe, it, expect } from 'vitest';

import { EARSValidator } from '../ears-validator.js';

describe('EARSValidator', () => {
  describe('validate - event-driven pattern', () => {
    it('should validate correct WHEN pattern', () => {
      const statement =
        'WHEN the user clicks the button, the system SHALL display a confirmation dialog.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(true);
      expect(result.pattern).toBe('event-driven');
      expect(result.errors).toBeUndefined();
    });

    it('should reject WHEN without comma', () => {
      const statement = 'WHEN the user clicks the button the system SHALL display a dialog.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validate - state-driven pattern', () => {
    it('should validate correct WHILE pattern', () => {
      const statement = 'WHILE the user is logged in, the system SHALL show the dashboard.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(true);
      expect(result.pattern).toBe('state-driven');
    });
  });

  describe('validate - unwanted-behavior pattern', () => {
    it('should validate correct IF-THEN pattern', () => {
      const statement =
        'IF an error occurs, THEN the system SHALL log the error and notify the user.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(true);
      expect(result.pattern).toBe('unwanted-behavior');
    });

    it('should reject IF without THEN', () => {
      const statement = 'IF an error occurs, the system SHALL log the error.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.includes('THEN'))).toBe(true);
    });
  });

  describe('validate - optional pattern', () => {
    it('should validate correct WHERE pattern', () => {
      const statement = 'WHERE dark mode is enabled, the system SHALL use dark theme colors.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(true);
      expect(result.pattern).toBe('optional');
    });
  });

  describe('validate - ubiquitous pattern', () => {
    it('should validate correct ubiquitous pattern', () => {
      const statement = 'The system SHALL validate all user inputs.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(true);
      expect(result.pattern).toBe('ubiquitous');
    });

    it('should reject statement without SHALL', () => {
      const statement = 'The system must validate all user inputs.';
      const result = EARSValidator.validate(statement);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.includes('SHALL'))).toBe(true);
    });
  });

  describe('detectPattern', () => {
    it('should detect event-driven pattern', () => {
      const statement = 'WHEN the user submits, the system SHALL validate.';
      const pattern = EARSValidator.detectPattern(statement);

      expect(pattern).toBe('event-driven');
    });

    it('should detect state-driven pattern', () => {
      const statement = 'WHILE processing, the system SHALL show a spinner.';
      const pattern = EARSValidator.detectPattern(statement);

      expect(pattern).toBe('state-driven');
    });

    it('should return undefined for invalid pattern', () => {
      const statement = 'This is not a valid EARS requirement.';
      const pattern = EARSValidator.detectPattern(statement);

      expect(pattern).toBeUndefined();
    });
  });

  describe('isValid', () => {
    it('should return true for valid EARS statement', () => {
      const statement = 'WHEN the user logs out, the system SHALL clear the session.';
      const valid = EARSValidator.isValid(statement);

      expect(valid).toBe(true);
    });

    it('should return false for invalid statement', () => {
      const statement = 'The system validates inputs.';
      const valid = EARSValidator.isValid(statement);

      expect(valid).toBe(false);
    });
  });

  describe('getSupportedPatterns', () => {
    it('should return all supported patterns', () => {
      const patterns = EARSValidator.getSupportedPatterns();

      expect(patterns).toContain('event-driven');
      expect(patterns).toContain('state-driven');
      expect(patterns).toContain('unwanted-behavior');
      expect(patterns).toContain('optional');
      expect(patterns).toContain('ubiquitous');
      expect(patterns).toHaveLength(5);
    });
  });

  describe('getPatternDescription', () => {
    it('should return description for each pattern', () => {
      const desc = EARSValidator.getPatternDescription('event-driven');

      expect(desc).toContain('WHEN');
      expect(desc).toContain('SHALL');
    });
  });

  describe('suggestCorrections', () => {
    it('should suggest adding SHALL for missing keyword', () => {
      const statement = 'The system validates inputs';
      const suggestions = EARSValidator.suggestCorrections(statement);

      expect(suggestions.some((s) => s.includes('SHALL'))).toBe(true);
    });

    it('should suggest event-driven pattern when appropriate', () => {
      const statement = 'when user clicks button system does something';
      const suggestions = EARSValidator.suggestCorrections(statement);

      expect(suggestions.some((s) => s.includes('WHEN'))).toBe(true);
    });

    it('should suggest unwanted behavior pattern for errors', () => {
      const statement = 'if error happens system logs it';
      const suggestions = EARSValidator.suggestCorrections(statement);

      expect(suggestions.some((s) => s.includes('IF'))).toBe(true);
    });
  });

  describe('warnings', () => {
    it('should warn about vague requirements', () => {
      const statement = 'The system SHALL work.';
      const result = EARSValidator.validate(statement);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes('vague'))).toBe(true);
    });

    it('should warn about long requirements', () => {
      const statement = `WHEN the user performs a very complex operation that involves multiple steps and interactions with various components and subsystems of the application including but not limited to data validation, processing, storage, retrieval, and presentation across multiple layers and tiers, the system SHALL ensure that all operations complete successfully.`;
      const result = EARSValidator.validate(statement);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes('long'))).toBe(true);
    });
  });
});
