const path = require('path');
const webpack = require("webpack");

var options = {
  "site": 'today',
  "minify": true
};

var plugins = [];
var isDev = false;

var workingDir = __dirname;

//if we are being run as an npm module, then use the parent path instead.
if (__dirname.indexOf('node_modules') !== -1) {
  workingDir = (__dirname.split('/node_modules'))[0];
}

process.argv.forEach(function (val, index, array) {
  const splitted = val.split('/');
  if ((splitted[splitted.length - 1] === 'bundle') && (typeof process.argv[index + 1] !== "undefined")) {
    options.site = process.argv[index + 1];
  }

  if (val === '-dev') {
    isDev = true;
    options.minify = false;
  }

});

if (options.minify) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      mangle: {
        //props: true
        //toplevel: true
      }
    })
  );
}

const filename =  options.site + '_bundle' + (options.minify?'_min':'') + '.js';

const wpConfig = {
  context: __dirname,
  entry: "./sites/" + options.site + ".js",
  output: {
    "path": __dirname + '/dist/' + options.site + '/',
    "filename":  filename,
    "publicPath": '/' + options.site + '/'
  },
  resolve: {
    modules: [
      path.resolve(__dirname)
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
  if (isDev) {
    console.log(stats);
  }
});




/**
 We could also do

compiler.watch({ // watch options:
  aggregateTimeout: 300, // wait so long for more changes
  poll: true // use polling instead of native watchers
  // pass a number to set the polling interval
}, function(err, stats) {
  // ...
});


 */
