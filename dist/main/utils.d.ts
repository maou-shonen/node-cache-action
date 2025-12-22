/**
 * Check if a file exists
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Calculate SHA-256 hash of a file
 */
export declare function hashFile(filePath: string): Promise<string>;
/**
 * Expand tilde (~) in path to home directory
 */
export declare function expandTilde(filepath: string): string;
/**
 * Expand all tildes in an array of paths
 */
export declare function expandPaths(paths: string[]): string[];
