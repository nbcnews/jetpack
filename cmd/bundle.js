const globals = require('../lib/helpers/globals');
const path = require('path');
const webpack = require('webpack');
const info = require('../lib/helpers/info');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const validator = require('../lib/helpers/validation');
var exec = require('child_process').exec;

module.exports = function() {
  var workingDir = globals.workingDir();
  var site = globals.site();
  var tag = globals.tag();

  var doMinify = !globals.isDevMode();
  var plugins = [];

  plugins.push(new CleanWebpackPlugin([workingDir + '/dist/' + site], {
    root: workingDir,
    verbose: true,
    dry: false,
    exclude: []
  }));

  const devpp = process.env.PUBLIC_PATH_DEV || 'http://127.0.0.1:8888/';
  const pp = globals.isDevMode() ? (devpp + site + '/') : (process.env.PUBLIC_PATH + site + '/' + tag + '/');

  info.log('PUBLIC PATH ' + pp);

  plugins.push(new webpack.DefinePlugin({
    JETPACK_SITE: JSON.stringify(globals.site()),
    JETPACK_VERSION: JSON.stringify(globals.tag()),
    JETPACK_PUBLIC_PATH : JSON.stringify(pp)
  }));

  if (doMinify) {
    plugins.push(function doShrinkwrap() {
      this.plugin("compile", function() {
        const cmd = 'npm shrinkwrap';
        exec(cmd, function(error, stdout, stderr) {
          console.log('shrinkwrapping');
        });
      });
    });

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
    this.plugin("compile", function (/*params*/) {
      info.log('packaging ' + site);
    });
    this.plugin("done", function (stats) {
      if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
        info.error('webpack build failed.');
        info.error(stats.compilation.errors);
      } else {
        info.log('files packaged:');
        stats.compilation.fileDependencies.forEach(function (f) {
          info.log(f);
        });
        info.log('missing dependencies:');
        stats.compilation.missingDependencies.forEach(function (f) {
          info.log(f);
        });
        info.log('assets created:');
        Object.keys(stats.compilation.assets).forEach(function(key) {
          var thing = stats.compilation.assets[key];
          if (Object.keys(thing).indexOf('_cachedSize') !== -1) {
            info.log(key + '  ' + (thing._cachedSize / 1000) + 'k');
          } else {
            info.log(key);
          }
        });
      }

      validator.createAndVerifyManifest(function writeReleaseFile(manifest) {
        var jsonStr = manifest.stringify();
        info.log(jsonStr);
        manifest.write();
      });
    });
  });

  const filename =  site + '_bundle' + (doMinify?'_min':'') + '.js';
  console.log('current directory!', workingDir + '/node_modules/jetpack/node_modules');


  const wpConfig = {
    context: workingDir,
    entry: workingDir + "/sites/" + site + ".js",
    output: {
      "path": workingDir + '/dist/' + site + '/',
      "filename":  filename,
      "publicPath": pp
    },
    resolve: {
      modules: [
        path.resolve(__dirname.replace('/cmd','')),
        path.resolve(__dirname.replace('/lib','')),
        path.resolve(workingDir)
      ]
    },
    resolveLoader: {
      modules: [workingDir + '/node_modules', workingDir + '/node_modules/jetpack/node_modules']
    },
    module: {
      loaders: [{
        test: /\.es6$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },{
        test: /\.js$/,
        loader: "jshint-loader",
        options: { //TODO ignore /node_modules
          esversion: 5,
          emitErrors: false,
          failOnHint: false,
          reporter: function(errors) {
            //ignore import is only available in ES6
            errors.forEach(function(err) {
              if (err.reason.indexOf('import\' is only available') === -1 && err.reason.indexOf('export\' is only available') === -1) {
                info.error(err.id + err.code + ' ' + err.reason);
                info.error(' ' + err.scope + 'line:' + err.line + ' character:' + err.character + '::' + err.evidence);
              }
            });
          }
        }
      },{
        test: /\.es6$/,
        loader: "jshint-loader",
        options: {
          esversion: 6,
          emitErrors: false,
          failOnHint: false,
          reporter: function(errors) {
            //ignore import is only available in ES6
            errors.forEach(function(err) {
              if (err.reason.indexOf('import\' is only available') === -1 && err.reason.indexOf('export\' is only available') === -1) {
                info.error(err.id + err.code + ' ' + err.reason);
                info.error(' ' + err.scope + 'line:' + err.line + ' character:' + err.character + '::' + err.evidence);
              }
            });
          }
        }
      }, {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }, {
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
  };

  var compiler = webpack(wpConfig);

  compiler.run(function(/*err, stats*/) {
    info.log('done');
  });

};
