import { execSync } from 'node:child_process';
import process from 'node:process';

try {
  execSync('eslint . --fix', { stdio: 'inherit' });
} catch {
  process.exit(1);
}
