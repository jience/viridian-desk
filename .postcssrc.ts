import pxtorem from 'postcss-pxtorem';

export default {
  plugins: [
    pxtorem({
      rootValue: 100, // 1rem = 100px
      propList: ['*'], // 可以从px转换成rem的属性
    }),
  ],
};
