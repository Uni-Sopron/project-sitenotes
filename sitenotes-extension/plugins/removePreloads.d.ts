// plugins/removePreloads.d.ts
import { Plugin } from 'vite';

declare function removePreloads(options?: { filter?: (linkStr: string) => boolean }): Plugin;

export default removePreloads;