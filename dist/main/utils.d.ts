export declare function fileExists(filePath: string): Promise<boolean>;
export declare function hashFile(filePath: string): Promise<string>;
export declare function expandTilde(filepath: string): string;
export declare function expandPaths(paths: string[]): string[];
