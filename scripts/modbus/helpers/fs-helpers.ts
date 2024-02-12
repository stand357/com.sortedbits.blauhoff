import path from 'path';
import { readdirSync, lstatSync, existsSync } from 'fs';

export const findFile = (directory: string, filter: string): string[] => {
    const fullDirectory = path.resolve(directory);

    let result: string[] = [];

    if (!existsSync(directory)) {
        // eslint-disable-next-line no-console
        console.log('Path does not exist', fullDirectory);
        return [];
    }

    const files = readdirSync(directory);
    for (const file of files) {
        const filename = path.join(fullDirectory, file);

        const stat = lstatSync(filename);

        if (stat.isDirectory()) {
            result = result.concat(findFile(filename, filter));
        } else if (filename.toLowerCase().indexOf(filter) > -1) {
            result.push(filename);
        }
    }
    return result;
};
