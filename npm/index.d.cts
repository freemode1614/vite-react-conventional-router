import { Pattern } from 'fast-glob';
import { Plugin } from 'vite';

type ConventionalRouterProps = {
    pages: Pattern | Pattern[];
};
declare function ConventionalRouter(options?: Partial<ConventionalRouterProps>): Plugin;

export { ConventionalRouter as default };
