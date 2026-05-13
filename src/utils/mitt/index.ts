import mitt from 'mitt';
import type { Events } from './types';

export const globalEmitter = mitt<Events>();
