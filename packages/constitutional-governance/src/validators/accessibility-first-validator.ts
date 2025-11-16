/**
 * Article 7: Accessibility-First Validator
 * Ensures code meets WCAG 2.1 AA accessibility standards
 * @module @musuhi-ng/constitutional-governance/validators
 */

import type { ValidationRule, ValidationContext, ValidationResult } from '../types.js';

/**
 * Accessibility-First Validator
 * Enforces Article 7: WCAG 2.1 AA compliance
 */
export class AccessibilityFirstValidator {
  /**
   * Create validation rules for Article 7
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'require-alt-text',
        description: 'All images must have alt text for screen reader support',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for img tags without alt attributes in JSX/TSX
          if (context.filePath.endsWith('.tsx') || context.filePath.endsWith('.jsx')) {
            const imgWithoutAlt = context.content.matchAll(
              /<img\s+(?![^>]*alt=)[^>]*>/gi
            );
            for (const match of imgWithoutAlt) {
              details.push(`Image tag without alt attribute: ${match[0].substring(0, 50)}...`);
              suggestions.push('Add alt attribute to all images for screen reader support');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 7,
              message: `Accessibility-First principle violated: ${details.length} images missing alt text`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 7,
            message: 'All images have alt text',
          };
        },
        severity: 'error',
      },
      {
        name: 'require-aria-labels',
        description: 'Interactive elements must have accessible labels',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          if (context.filePath.endsWith('.tsx') || context.filePath.endsWith('.jsx')) {
            // Check for buttons without accessible labels
            const buttonPattern = /<button\s+(?![^>]*(?:aria-label|aria-labelledby))[^>]*>(?:\s*<(?:svg|icon|img|i)[^>]*>)*\s*<\/button>/gi;
            const matches = context.content.matchAll(buttonPattern);
            for (const match of matches) {
              // Check if button has text content
              const hasTextContent = /<button[^>]*>[^<]*\w+[^<]*<\/button>/i.test(match[0]);
              if (!hasTextContent) {
                details.push(`Button without accessible label: ${match[0].substring(0, 50)}...`);
                suggestions.push('Add aria-label or visible text to buttons with only icons');
              }
            }

            // Check for input fields without labels
            const inputWithoutLabel = context.content.matchAll(
              /<input\s+(?![^>]*(?:aria-label|aria-labelledby|id="[^"]*"))[^>]*>/gi
            );
            for (const match of inputWithoutLabel) {
              details.push(`Input without label: ${match[0].substring(0, 50)}...`);
              suggestions.push('Associate input with label using htmlFor or aria-label');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 7,
              message: `${details.length} elements missing accessible labels`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 7,
            message: 'All interactive elements have accessible labels',
          };
        },
        severity: 'error',
      },
      {
        name: 'require-semantic-html',
        description: 'Use semantic HTML elements for better accessibility',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          if (context.filePath.endsWith('.tsx') || context.filePath.endsWith('.jsx')) {
            // Check for div with onClick instead of button
            const divWithOnClick = context.content.matchAll(
              /<div[^>]*onClick[^>]*>/gi
            );
            for (const match of divWithOnClick) {
              details.push(`Div with onClick detected: ${match[0].substring(0, 50)}...`);
              suggestions.push('Use <button> instead of <div onClick> for better accessibility');
            }

            // Check for missing heading hierarchy
            const hasH1 = /<h1[^>]*>/i.test(context.content);
            const hasH3 = /<h3[^>]*>/i.test(context.content);
            const hasH2 = /<h2[^>]*>/i.test(context.content);

            if (hasH3 && !hasH2 && hasH1) {
              details.push('Heading hierarchy skipped (h1 -> h3)');
              suggestions.push('Maintain proper heading hierarchy (h1, h2, h3, ...)');
            }

            // Check for missing main landmark
            if (context.content.includes('return (') && !/<main[^>]*>/i.test(context.content)) {
              const hasMultipleSections = (context.content.match(/<section[^>]*>/gi) || []).length > 2;
              if (hasMultipleSections) {
                details.push('Page layout missing <main> landmark');
                suggestions.push('Wrap main content in <main> element');
              }
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 7,
              message: 'Semantic HTML issues detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 7,
            message: 'Semantic HTML is properly used',
          };
        },
        severity: 'warning',
      },
      {
        name: 'check-color-contrast',
        description: 'Ensure color contrast meets WCAG AA standards',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for potential low contrast color combinations in CSS/styles
          if (
            context.filePath.endsWith('.css') ||
            context.filePath.endsWith('.scss') ||
            context.content.includes('styled.')
          ) {
            const lightTextOnLightBg = /color:\s*(?:#(?:fff|ffffff|f\w\w|e\w\w|d\w\w)|white|lightgray).*background(?:-color)?:\s*(?:#(?:fff|ffffff|f\w\w|e\w\w)|white)/is;
            const darkTextOnDarkBg = /color:\s*(?:#(?:000|000000|0\w\w|1\w\w|2\w\w)|black|darkgray).*background(?:-color)?:\s*(?:#(?:000|000000|0\w\w|1\w\w|2\w\w)|black)/is;

            if (lightTextOnLightBg.test(context.content)) {
              details.push('Potential low contrast: light text on light background');
              suggestions.push('Ensure color contrast ratio meets WCAG AA standards (4.5:1 for normal text)');
            }

            if (darkTextOnDarkBg.test(context.content)) {
              details.push('Potential low contrast: dark text on dark background');
              suggestions.push('Ensure color contrast ratio meets WCAG AA standards (4.5:1 for normal text)');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 7,
              message: 'Color contrast issues detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 7,
            message: 'No obvious color contrast issues',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-keyboard-navigation',
        description: 'Interactive elements must support keyboard navigation',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          if (context.filePath.endsWith('.tsx') || context.filePath.endsWith('.jsx')) {
            // Check for onMouseEnter/onMouseLeave without keyboard equivalents
            if (/onMouseEnter/i.test(context.content) && !/onFocus/i.test(context.content)) {
              details.push('onMouseEnter found without onFocus');
              suggestions.push('Add onFocus handler for keyboard navigation support');
            }

            if (/onMouseLeave/i.test(context.content) && !/onBlur/i.test(context.content)) {
              details.push('onMouseLeave found without onBlur');
              suggestions.push('Add onBlur handler for keyboard navigation support');
            }

            // Check for onClick without onKeyDown/onKeyPress
            const onClickCount = (context.content.match(/onClick=/gi) || []).length;
            const onKeyCount = (context.content.match(/onKey(?:Down|Press)=/gi) || []).length;

            if (onClickCount > onKeyCount && onClickCount > 3) {
              details.push('Multiple onClick handlers without keyboard event handlers');
              suggestions.push('Ensure interactive elements support keyboard navigation');
            }

            // Check for tabIndex=-1 on interactive elements
            if (/<(?:button|a|input|select|textarea)[^>]*tabIndex="-1"/i.test(context.content)) {
              details.push('Interactive element with tabIndex="-1" detected');
              suggestions.push('Avoid removing elements from tab order unless necessary');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 7,
              message: 'Keyboard navigation issues detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 7,
            message: 'Keyboard navigation is properly supported',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-focus-indicators',
        description: 'Elements must have visible focus indicators',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for outline: none without alternative focus indicator
          if (context.filePath.endsWith('.css') || context.filePath.endsWith('.scss')) {
            const outlineNone = /(?:outline|outline-width):\s*(?:none|0)/gi;
            const hasFocusVisible = /:focus-visible/i.test(context.content);
            const hasFocusStyles = /:focus\s*\{[^}]*(?:border|box-shadow|background)/is.test(context.content);

            if (outlineNone.test(context.content) && !hasFocusVisible && !hasFocusStyles) {
              details.push('outline: none detected without alternative focus indicator');
              suggestions.push('Provide visible focus indicators using :focus-visible or custom styles');
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 7,
              message: 'Focus indicator issues detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 7,
            message: 'Focus indicators are properly implemented',
          };
        },
        severity: 'error',
      },
    ];
  }
}
