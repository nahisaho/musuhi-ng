/**
 * Article 9: Integration-First Validator
 * Ensures proper API contracts and integration testing
 * @module @musuhi/constitutional-governance/validators
 */

import type { ValidationRule, ValidationContext, ValidationResult } from '../types.js';

/**
 * Integration-First Validator
 * Enforces Article 9: API contracts and integration testing
 */
export class IntegrationFirstValidator {
  /**
   * Create validation rules for Article 9
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'require-api-documentation',
        description: 'API endpoints must have OpenAPI/Swagger documentation',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for API endpoints without OpenAPI/Swagger documentation
          const apiRoutePatterns = [
            /(?:router|app)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
            /@(?:Get|Post|Put|Patch|Delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
          ];

          const endpoints: string[] = [];
          for (const pattern of apiRoutePatterns) {
            let match;
            while ((match = pattern.exec(context.content)) !== null) {
              const method = match[1]?.toUpperCase() || '';
              const path = match[2] || match[1] || '';
              endpoints.push(`${method} ${path}`);
            }
          }

          if (endpoints.length > 0) {
            // Check if there's OpenAPI/Swagger documentation
            const hasOpenAPIDoc = /\/\*\*[\s\S]*?@swagger[\s\S]*?\*\//i.test(context.content) ||
                                  /\/\*\*[\s\S]*?@openapi[\s\S]*?\*\//i.test(context.content);

            if (!hasOpenAPIDoc && endpoints.length > 2) {
              details.push(`${endpoints.length} API endpoints without OpenAPI documentation`);
              suggestions.push('Add @swagger or @openapi JSDoc comments to document API endpoints');
              suggestions.push('Include request/response schemas, parameters, and status codes');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 9,
              message: 'Integration-First principle violated: API documentation missing',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 9,
            message: 'API endpoints properly documented',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-request-validation',
        description: 'API routes must validate all request inputs',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for API routes without request validation
          const hasRouteHandler = /(?:router|app)\.(get|post|put|patch|delete)\s*\(/i.test(
            context.content
          );

          if (hasRouteHandler) {
            const hasValidation = /(?:validate|schema|zod|yup|joi)\./i.test(context.content) ||
                                  /@(?:Body|Query|Param)\s*\(/i.test(context.content);

            if (!hasValidation) {
              details.push('API routes without input validation detected');
              suggestions.push('Add request validation using Zod, Yup, or class-validator');
              suggestions.push('Validate all inputs to prevent invalid data and injection attacks');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 9,
              message: 'Request validation missing',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 9,
            message: 'Request validation properly implemented',
          };
        },
        severity: 'error',
      },
      {
        name: 'require-error-handling',
        description: 'Async route handlers must have proper error handling',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for async route handlers without error handling
          const asyncHandlers = context.content.matchAll(
            /(?:router|app)\.(get|post|put|patch|delete)\s*\([^,]+,\s*async\s*\([^)]*\)\s*=>\s*\{/gi
          );

          for (const match of asyncHandlers) {
            const handlerStart = match.index || 0;
            const handlerCode = context.content.substring(handlerStart, handlerStart + 500);

            // Check if handler has try-catch
            const hasTryCatch = /try\s*\{/.test(handlerCode);
            const hasErrorMiddleware = /\.catch\s*\(|next\s*\(/i.test(handlerCode);

            if (!hasTryCatch && !hasErrorMiddleware) {
              details.push('Async route handler without error handling');
              suggestions.push('Wrap async handlers in try-catch or use error handling middleware');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 9,
              message: 'Error handling missing in API routes',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 9,
            message: 'Error handling properly implemented',
          };
        },
        severity: 'error',
      },
      {
        name: 'require-versioned-apis',
        description: 'API routes should include version numbers for compatibility',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for API routes without versioning
          const apiRoutes = context.content.matchAll(
            /(?:router|app)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi
          );

          const unversionedRoutes: string[] = [];
          for (const match of apiRoutes) {
            const path = match[2] || '';
            // Check if path includes version (v1, v2, etc.)
            if (!path.startsWith('/v') && !path.includes('/api/v')) {
              unversionedRoutes.push(path);
            }
          }

          if (unversionedRoutes.length > 3) {
            details.push(`${unversionedRoutes.length} API routes without versioning`);
            suggestions.push('Use API versioning (e.g., /api/v1/...) for better compatibility');
            suggestions.push('Versioning allows breaking changes without affecting existing clients');
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 9,
              message: 'API versioning not implemented',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 9,
            message: 'API versioning properly implemented',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-response-typing',
        description: 'API responses must have TypeScript type definitions',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for API responses without type definitions
          if (context.filePath.endsWith('.ts') || context.filePath.endsWith('.tsx')) {
            const hasResponseReturn = /res\.(?:json|send|status)\s*\(/i.test(context.content);
            const hasResponseType = /:\s*Response(?:<[^>]+>)?/i.test(context.content) ||
                                    /interface\s+\w+Response/i.test(context.content) ||
                                    /type\s+\w+Response/i.test(context.content);

            if (hasResponseReturn && !hasResponseType) {
              details.push('API responses without TypeScript type definitions');
              suggestions.push('Define response types/interfaces for type safety');
              suggestions.push('Use generic types for consistent API responses');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 9,
              message: 'Response typing missing',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 9,
            message: 'Response types properly defined',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-integration-tests',
        description: 'New API files should have integration tests',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check if this is an API file with routes
          const hasApiRoutes = /(?:router|app)\.(get|post|put|patch|delete)\s*\(/i.test(
            context.content
          );

          if (hasApiRoutes && context.delta?.type === 'create') {
            // Suggest creating integration tests for new API files
            const testPath = context.filePath
              .replace('/src/', '/src/__tests__/')
              .replace('.ts', '.integration.test.ts');

            details.push('New API file without integration tests');
            suggestions.push(`Create integration tests at ${testPath}`);
            suggestions.push('Test API endpoints with real HTTP requests');
            suggestions.push('Verify request validation, response format, and error handling');
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 9,
              message: 'Integration tests missing',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 9,
            message: 'Integration tests present or not applicable',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-rate-limiting',
        description: 'Public API routes must have rate limiting to prevent abuse',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for public API routes without rate limiting
          const hasPublicRoutes = /(?:router|app)\.(?:post|put|patch|delete)\s*\(/i.test(
            context.content
          );

          if (hasPublicRoutes) {
            const hasRateLimiting = /rateLimit|rate-limit|throttle|express-rate-limit/i.test(
              context.content
            );

            if (!hasRateLimiting) {
              details.push('Public API routes without rate limiting');
              suggestions.push('Add rate limiting middleware to prevent abuse');
              suggestions.push('Use express-rate-limit or similar for API protection');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 9,
              message: 'Rate limiting not implemented',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 9,
            message: 'Rate limiting properly configured',
          };
        },
        severity: 'warning',
      },
    ];
  }
}
