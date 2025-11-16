/**
 * Init Command
 * Initialize a new MUSUHI project
 * @module @musuhi-ng/cli/commands
 */

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';

export const initCommand = new Command('init')
  .description('Initialize a new MUSUHI project')
  .option('-d, --dir <directory>', 'Target directory', process.cwd())
  .action(async (options) => {
    const targetDir = options.dir;

    console.log(`Initializing MUSUHI project in ${targetDir}...`);

    try {
      // Create directory structure
      await createDirectoryStructure(targetDir);

      // Create configuration files
      await createConfigFiles(targetDir);

      console.log('✓ MUSUHI project initialized successfully!');
      console.log('\nNext steps:');
      console.log('  1. Review the constitution.md file');
      console.log('  2. Start with: musuhi workflow start research');
      console.log('  3. Follow the 8-stage SDD workflow');
    } catch (error) {
      console.error('Error initializing project:', error);
      process.exit(1);
    }
  });

async function createDirectoryStructure(baseDir: string): Promise<void> {
  const directories = [
    'docs/research',
    'docs/requirements',
    'docs/design',
    'docs/tasks',
    'steering/rules',
    'steering/templates',
    '.musuhi',
  ];

  for (const dir of directories) {
    const fullPath = path.join(baseDir, dir);
    await fs.mkdir(fullPath, { recursive: true });
  }
}

async function createConfigFiles(baseDir: string): Promise<void> {
  // Create .musuhi/config.json
  const config = {
    version: '2.0.0',
    constitutional: {
      enabled: true,
      strictMode: true,
    },
    workflow: {
      currentStage: 'research',
      stages: [],
    },
  };

  await fs.writeFile(
    path.join(baseDir, '.musuhi', 'config.json'),
    JSON.stringify(config, null, 2)
  );

  // Create basic constitution.md
  const constitutionContent = `# MUSUHI Constitution

## Immutable Development Principles

### Article 1: Library-First
**Principle**: Prefer existing npm packages over custom implementations.

**Enforcement**: Phase -1 Gate validation checks for custom implementations of common functionality.

### Article 2: Test-First
**Principle**: Write tests before implementation code.

**Enforcement**: Phase -1 Gate blocks commits without corresponding tests.

### Article 3: Security-First
**Principle**: Follow OWASP Top 10, prevent common vulnerabilities.

**Enforcement**: Phase -1 Gate scans for security anti-patterns.

### Article 4: Documentation-First
**Principle**: All code must have proper documentation.

**Enforcement**: JSDoc comments required for all exports.

### Article 5: Simplicity-First
**Principle**: Maintain low cyclomatic complexity (< 10).

**Enforcement**: Phase -1 Gate checks code complexity.

### Article 6: Performance-First
**Principle**: Follow performance best practices and budgets.

**Enforcement**: Phase -1 Gate checks for blocking operations.

### Article 7: Accessibility-First
**Principle**: Meet WCAG 2.1 AA standards.

**Enforcement**: Phase -1 Gate validates accessibility patterns.

### Article 8: Privacy-First
**Principle**: Follow GDPR, practice data minimization.

**Enforcement**: Phase -1 Gate checks for PII logging and consent.

### Article 9: Integration-First
**Principle**: Maintain API contracts, require integration tests.

**Enforcement**: Phase -1 Gate validates API documentation and tests.
`;

  await fs.writeFile(
    path.join(baseDir, 'steering', 'constitution.md'),
    constitutionContent
  );
}
