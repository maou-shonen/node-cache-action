import type { DetectionResult } from './constants.js';
/**
 * Detect package manager by checking lockfiles in priority order:
 * bun → pnpm → yarn → npm
 */
export declare function detectPackageManager(cwd?: string): Promise<DetectionResult>;
