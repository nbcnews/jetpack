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

  plugins.push(new CleanWebpackPlugin(['dist/' + site], {
    root: globals.PWD,
    verbose: true,
    dry: false,
    exclude: []
  }));

  info.log('PUBLIC PATH ' + process.env.PUBLIC_PATH);

  plugins.push(new webpack.DefinePlugin({
    JETPACK_SITE: JSON.stringify(globals.site()),
    JETPACK_VERSION: JSON.stringify(globals.tag()),
    JETPACK_PUBLIC_PATH : JSON.stringify(process.env.PUBLIC_PATH + site + '/' + tag + '/')
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
        info.log(Object.keys(stats.compilation.assets));
      }

      validator.createAndVerifyManifest(function writeReleaseFile(manifest) {
        var jsonStr = manifest.stringify();
        console.log(jsonStr);

        var fs = require('fs');
        fs.writeFile(globals.dist() + 'release.json', jsonStr, function (err) {
          if (err) {
            throw err;
          }
        });
      });
    });
   });

  const filename =  site + '_bundle' + (doMinify?'_min':'') + '.js';

  const wpConfig = {
    context: workingDir,
    entry: workingDir + "/sites/" + site + ".js",
    output: {
      "path": workingDir + '/dist/' + site + '/',
      "filename":  filename,
      "publicPath": process.env.PUBLIC_PATH + site + '/' + tag + '/'
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
        test: /\.js$/,
        loader: "jshint-loader",
        options: {
          esversion: 5,
          emitErrors: false,
          failOnHint: false,
          reporter: function(errors) {
            //ignore import is only available in ES6
            errors.forEach(function(err) {
              if (err.reason.indexOf('import\' is only available') === -1 && err.reason.indexOf('export\' is only available') === -1) {
                info.error(JSON.stringify(err));
                /* info.error(err.reason);
                info.log(err.evidence);
                info.log(err.scope + ' line:' + err.line + ' char:' + err.character);
                */
              }
            });
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
  };

  var compiler = webpack(wpConfig);

  compiler.run(function(/*err, stats*/) {
    info.log('done');
  });

};
