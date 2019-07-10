import { AbsolutePath, PathResolver, Resolution } from "../interfaces";
export default class PathResolverImpl implements PathResolver {
    private pathInfoCache;
    private resolutionCache;
    constructor(rootPath: AbsolutePath, inputPath: AbsolutePath);
    resolve(path: string): Resolution;
    reset(): void;
}
