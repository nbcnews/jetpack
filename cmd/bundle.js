const path = require('path');
const webpack = require('webpack');
const info = require('./info');
const helpers = require('./helpers');
var CleanWebpackPlugin = require('clean-webpack-plugin');

const env = helpers.env();

module.exports = function(site, tag, isDev) {
  var workingDir = helpers.workingDir();

  var doMinify = !isDev;
  var plugins = [];

  plugins.push(new CleanWebpackPlugin(['dist/' + site], {
    root: env.PWD,
    verbose: true,
    dry: false,
    exclude: []
  }));

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

      if (!isDev) {
        helpers.writeManifest(site, tag);
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
      "publicPath": env.PUBLIC_PATH + site + '/' + tag + '/'
    },
    resolve: {
      modules: [
        path.resolve(__dirname.replace('/cmd','')),
        path.resolve(__dirname.replace('/lib','')),
        path.resolve(workingDir)
      ]
    },
    module: {
      rules: [
      ],
      loaders: [{
        test: /\.js$/,
        loader: "jshint-loader",
        options: {
          emitErrors: false,
          failOnHint: false,
          reporter: function(errors) {
            console.log(errors);
          }
        }
      },{
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },{
        test: /\.html$/,
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
