import * as logger from '@moccona/logger';
import { Pattern } from 'fast-glob';
import { Plugin } from 'vite';

type ConventionalRouterProps = {
    include: Pattern | Pattern[];
    exclude: Pattern | Pattern[];
};
declare const log: logger.LoggerMethods;
declare function ConventionalRouter(options?: Partial<ConventionalRouterProps>): Plugin;

export { ConventionalRouter as default, log };
