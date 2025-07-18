const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    plugins: [
      process.env.ANALYZE && new WebpackBundleAnalyzer({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
        generateStatsFile: true, // Thêm dòng này để tạo file stats.json
        statsFilename: 'stats.json', // Tên file stats.json
      }),
    ].filter(Boolean),
  },
};
