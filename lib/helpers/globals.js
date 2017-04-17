var envLoader = require('node-env-file');
envLoader(process.env.PWD + '/project.jetpack');
envLoader(process.env.PWD + '/.env');

var isDev = false;
var site = null;
var tag = null;

var globals = {
  workingDir: function () {
    var workingDir = process.env.PWD || __dirname;

    //if we are being run as an npm module, then use the parent path instead.
    if (__dirname.indexOf('node_modules') !== -1) {
      workingDir = (__dirname.split('/node_modules'))[0];
    }

    return workingDir;
  },
  isDevMode: function () {
    return isDev;
  },
  site: function () {
    return site;
  },
  tag: function () {
    return tag;
  },
  setDevMode: function (isDevMode) {
    isDev = isDevMode;
  },
  setSite: function (siteVal) {
    site = siteVal;
  },
  setTag: function (tagVal) {
    tag = tagVal;
  },
  dist: function () {
    return globals.workingDir() + '/dist/' + site + '/';
  }
};

module.exports = globals;
