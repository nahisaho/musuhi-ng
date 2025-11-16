/**
 * Article 8: Privacy-First Validator
 * Ensures code follows privacy best practices (GDPR, data minimization)
 * @module @musuhi/constitutional-governance/validators
 */

import type { ValidationRule, ValidationContext, ValidationResult } from '../types.js';

/**
 * Privacy-First Validator
 * Enforces Article 8: Privacy and data protection
 */
export class PrivacyFirstValidator {
  /**
   * Create validation rules for Article 8
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'no-pii-logging',
        description: 'Prevent logging of personally identifiable information',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for potential PII being logged
          const piiKeywords = [
            'password',
            'email',
            'ssn',
            'creditCard',
            'credit_card',
            'phoneNumber',
            'phone_number',
            'address',
            'birthdate',
            'birth_date',
            'dob',
            'passport',
            'license',
            'userId',
            'user_id',
            'username',
          ];

          for (const keyword of piiKeywords) {
            // Check if PII is being logged
            const loggingPattern = new RegExp(
              `console\\.(?:log|info|warn|error|debug)\\([^)]*${keyword}[^)]*\\)`,
              'gi'
            );
            if (loggingPattern.test(context.content)) {
              details.push(`Potential PII logging detected: ${keyword}`);
              suggestions.push(`Avoid logging sensitive data like ${keyword}. Use redaction or omit from logs.`);
            }

            // Check for logger.info/debug with PII
            const loggerPattern = new RegExp(
              `logger\\.(?:info|debug|warn|error)\\([^)]*${keyword}[^)]*\\)`,
              'gi'
            );
            if (loggerPattern.test(context.content)) {
              details.push(`Potential PII logging in logger: ${keyword}`);
              suggestions.push(`Redact ${keyword} before logging or use structured logging with filters`);
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 8,
              message: `Privacy-First principle violated: ${details.length} potential PII logging instances`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 8,
            message: 'No obvious PII logging detected',
          };
        },
        severity: 'error',
      },
      {
        name: 'require-data-retention',
        description: 'User data storage must have retention policies',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for user data storage without retention policy
          const userDataPatterns = [
            /createUser\s*\(/i,
            /saveUser\s*\(/i,
            /storeUser\s*\(/i,
            /insertUser\s*\(/i,
          ];

          for (const pattern of userDataPatterns) {
            if (pattern.test(context.content)) {
              // Check if there's any mention of retention or expiration
              const hasRetentionLogic = /(?:ttl|expir|retention|delete.*after|cleanup)/i.test(
                context.content
              );
              if (!hasRetentionLogic) {
                details.push('User data storage without retention policy');
                suggestions.push(
                  'Implement data retention policy with automatic cleanup after retention period'
                );
              }
              break;
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 8,
              message: 'Data retention policy missing',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 8,
            message: 'Data retention properly handled',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-consent-tracking',
        description: 'Tracking and analytics must verify user consent',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for cookie/tracking code without consent check
          if (
            /(?:document\.cookie|localStorage|sessionStorage).*=.*(?:analytics|tracking|ga|gtm)/i.test(
              context.content
            )
          ) {
            const hasConsentCheck = /(?:consent|gdpr|cookie.*accept|opt.*in)/i.test(
              context.content
            );
            if (!hasConsentCheck) {
              details.push('Tracking/analytics code without consent check');
              suggestions.push('Implement consent check before setting tracking cookies');
            }
          }

          // Check for third-party analytics without consent
          const analyticsPatterns = [
            /gtag\s*\(/i,
            /ga\s*\(/i,
            /analytics\.track/i,
            /mixpanel\./i,
            /amplitude\./i,
          ];

          for (const pattern of analyticsPatterns) {
            if (pattern.test(context.content)) {
              const hasConsentCheck = /(?:consent|hasAccepted|userConsent)/i.test(
                context.content
              );
              if (!hasConsentCheck) {
                details.push('Third-party analytics without consent verification');
                suggestions.push('Verify user consent before initializing analytics');
              }
              break;
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 8,
              message: 'Consent tracking issues detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 8,
            message: 'Consent properly tracked',
          };
        },
        severity: 'error',
      },
      {
        name: 'avoid-excessive-data-collection',
        description: 'Practice data minimization - collect only necessary data',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for collecting more data than necessary
          if (/interface\s+User\s*\{/i.test(context.content)) {
            const userInterface = context.content.match(
              /interface\s+User\s*\{([^}]+)\}/is
            );
            if (userInterface && userInterface[1]) {
              const fields = userInterface[1];
              const sensitiveFields = [
                'socialSecurityNumber',
                'taxId',
                'mothersMaidenName',
                'driversLicense',
                'passportNumber',
              ];

              for (const field of sensitiveFields) {
                if (new RegExp(field, 'i').test(fields)) {
                  details.push(`Sensitive field '${field}' in User interface`);
                  suggestions.push(
                    `Avoid collecting ${field} unless absolutely necessary. Practice data minimization.`
                  );
                }
              }
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 8,
              message: 'Excessive data collection detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 8,
            message: 'Data collection follows minimization principle',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-data-encryption',
        description: 'Sensitive data must be encrypted in transit and at rest',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for storing sensitive data without encryption
          const sensitiveDataStorage = [
            { pattern: /password.*=.*req\.body/i, field: 'password' },
            { pattern: /creditCard.*=.*req\.body/i, field: 'credit card' },
            { pattern: /ssn.*=.*req\.body/i, field: 'SSN' },
          ];

          for (const { pattern, field } of sensitiveDataStorage) {
            if (pattern.test(context.content)) {
              // Check if there's encryption/hashing nearby
              const hasEncryption = /(?:encrypt|hash|bcrypt|crypto\.createHash|pbkdf2)/i.test(
                context.content
              );
              if (!hasEncryption) {
                details.push(`Storing ${field} without encryption/hashing`);
                suggestions.push(`Use bcrypt or similar for ${field} before storage`);
              }
            }
          }

          // Check for transmitting data without HTTPS
          if (/fetch\s*\(\s*['"]http:\/\//i.test(context.content)) {
            details.push('HTTP request detected (should use HTTPS)');
            suggestions.push('Use HTTPS for all data transmission');
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 8,
              message: 'Data encryption issues detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 8,
            message: 'Data encryption properly implemented',
          };
        },
        severity: 'error',
      },
      {
        name: 'require-right-to-delete',
        description: 'Support GDPR right to erasure with user deletion functionality',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for user creation without delete functionality
          const hasUserCreation = /(?:createUser|registerUser|signUp)\s*\(/i.test(
            context.content
          );
          const hasUserDeletion = /(?:deleteUser|removeUser|deactivateUser)\s*\(/i.test(
            context.content
          );

          if (hasUserCreation && !hasUserDeletion) {
            // Check if this is a routes/controller file
            if (
              context.filePath.includes('route') ||
              context.filePath.includes('controller') ||
              context.filePath.includes('api')
            ) {
              details.push('User creation without delete/deactivate functionality');
              suggestions.push(
                'Implement user deletion API to support GDPR right to erasure'
              );
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 8,
              message: 'Right to delete not implemented',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 8,
            message: 'User deletion functionality present',
          };
        },
        severity: 'warning',
      },
    ];
  }
}
