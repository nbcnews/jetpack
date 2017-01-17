const path = require('path');
const webpack = require('webpack');
const info = require('./lib/info');

var options = {
    "site": 'today',
    "minify": true
};

var plugins = [];
var isDev = false;

var workingDir = process.env.PWD || __dirname;

//if we are being run as an npm module, then use the parent path instead.
if (__dirname.indexOf('node_modules') !== -1) {
    workingDir = (__dirname.split('/node_modules'))[0];
}

//info.log(process.env);

var args = JSON.parse(process.env.npm_config_argv);

if (typeof args.remain !== 'undefined') {
    options.site = args.remain[0]; //get site name when running as npm script
}

process.argv.forEach(function (val, index, array) {
    if (val === '-dev') {
        isDev = true;
        options.minify = false;
        return;
    }
});


info.log('packaging ' + options.site);


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
    context: workingDir,
    entry: "./sites/" + options.site + ".js",
    output: {
        "path": workingDir + '/dist/' + options.site + '/',
        "filename":  filename,
        "publicPath": '/' + options.site + '/'
    },
    resolve: {
        modules: [
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
