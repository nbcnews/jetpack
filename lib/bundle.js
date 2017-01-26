const path = require('path');
const webpack = require('webpack');
const info = require('./info');

module.exports = function(site, isDev) {
  var workingDir = process.env.PWD || __dirname;

  //if we are being run as an npm module, then use the parent path instead.
  if (__dirname.indexOf('node_modules') !== -1) {
    workingDir = (__dirname.split('/node_modules'))[0];
  }

  var doMinify = !isDev;
  var plugins = [];

  if (doMinify) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        mangle: {
          //props: true
          //toplevel: true
        }
      })
    );
  }
  const filename =  site + '_bundle' + (doMinify?'_min':'') + '.js';

  const wpConfig = {
    context: workingDir,
    entry: workingDir + "/sites/" + site + ".js",
    output: {
      "path": workingDir + '/dist/' + site + '/',
      "filename":  filename,
      "publicPath": '/' + site + '/'
    },
    resolve: {
      modules: [
        path.resolve(__dirname.replace('/lib','')),
        path.resolve(workingDir)
      ]
    },
    module: {
      loaders: [{
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },{
        test: /\.html/,
        loader: "html-loader"
      }, {
        test: /\.(png|jpg|jpeg|gif|woff)$/,
        loader: "file-loader?name=[name].[ext]"
      }]
    },
    "plugins": plugins
  }

  var compiler = webpack(wpConfig);

  compiler.run(function(err, stats) {
    info.log('packaging ' + site);
    if (isDev) {
      info.log(stats);
    }
  });

}
