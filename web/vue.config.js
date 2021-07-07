const { ProvidePlugin } = require('webpack');

module.exports = {
  publicPath: '',

  outputDir: 'dist',

  pages: {
    index: {
      title: 'money',
      entry: 'src/main.ts',
      filename: 'index.html',
      template: 'src/main.html',
    },
  },

  devServer: {
    disableHostCheck: true,
  },

  chainWebpack: config => {
    config.module.rule('csv')
      .test(/\.csv$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end();
  },

  configureWebpack: {
    plugins: [
      new ProvidePlugin({
        Chart: ['chart.js', 'Chart'],
        // ...
      })
    ],
  },
};
