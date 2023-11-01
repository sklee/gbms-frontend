const path = require('path');
const CracoAntDesignPlugin = require('craco-antd');

module.exports = {
  babel: {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@stores': './src/stores',
            '@utils': './src/utils',
            '@pages': './src/pages',
            '@components': './src/components',
            '@node_modules': './node_modules',
            '@shared': './src/shared',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
    ],
  },
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeThemeLessPath: path.join(__dirname, 'styles/antd-custom.less'),
      },
    },
  ],
  devServer: {
    open: false,
    historyApiFallback: true,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    },
    proxy: [
      {
        context: ['*'],
        target: 'http://gbms-frontend-nginx',
        secure: false,
        changeOrigin: true,
      },
    ],
  },
};
