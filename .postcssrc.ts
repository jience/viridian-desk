import { createRequire } from 'node:module';

type PxToRemOptions = {
  rootValue: number;
  propList: string[];
};

type PxToRemFactory = (options: PxToRemOptions) => unknown;

const require = createRequire(import.meta.url);
const pxtorem = require('postcss-pxtorem') as PxToRemFactory;

export default {
  plugins: [
    pxtorem({
      rootValue: 100, // 1rem = 100px
      propList: ['*'], // 可以从px转换成rem的属性
    }),
  ],
};
