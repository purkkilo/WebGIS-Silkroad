module.exports = {
  outputDir: "../server/public",
  devServer: {
    port: 8081,
  },
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
};
