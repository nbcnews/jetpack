const env = require('node-env-file');
const path = require('path');
const webpack = require('webpack');
const info = require('./info');
const helpers = require('./helpers');

env(process.env.PWD + '/.env');

module.exports = function(site, tag, isDev) {
  var workingDir = helpers.workingDir();

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

   plugins.push(function giveMeErrors() {
    this.plugin("compile", function (params) {
      info.log('packaging ' + site);
    });
    this.plugin("done", function (stats) {
      if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
        info.error('webpack build failed.');
        info.error(stats.compilation.errors);
      } else if (isDev) {
        info.log(stats);
      }
    });
  });

  const filename =  site + '_bundle' + (doMinify?'_min':'') + '.js';

  const wpConfig = {
    context: workingDir,
    entry: workingDir + "/sites/" + site + ".js",
    output: {
      "path": workingDir + '/dist/' + site + '/',
      "filename":  filename,
      "publicPath": process.env.PUBLIC_PATH + site + '/' + tag
    },
    resolve: {
      modules: [
        path.resolve(__dirname.replace('/cmd','')),
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
      }, {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      }]
    },
    "plugins": plugins
  }

  var compiler = webpack(wpConfig);

  compiler.run(function(err, stats) {
    info.log('done');
  });

}