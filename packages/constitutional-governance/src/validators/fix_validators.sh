#!/bin/bash

# Fix performance-first-validator.ts
sed -i '20a\        description: '\''Avoid blocking synchronous file system operations'\'','  performance-first-validator.ts
sed -i '21s/^        validator/          if (!context.content) { return { valid: true, message: '\''No content to validate'\'' }; }\n\n        validator/' performance-first-validator.ts
sed -i '64a\        description: '\''Avoid inefficient patterns in loops'\'','  performance-first-validator.ts
sed -i '116a\        description: '\''Optimize imports to reduce bundle size'\'','  performance-first-validator.ts
sed -i '164a\        description: '\''Prevent memory leaks from uncleaned resources'\'','  performance-first-validator.ts
sed -i '214a\        description: '\''Use async/await instead of long promise chains'\'','  performance-first-validator.ts

echo "Fixed performance-first-validator.ts"
