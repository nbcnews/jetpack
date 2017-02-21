/**
 * Created by j-toddwa on 2/21/17.
 */

exports.workingDir = function() {
  var workingDir = process.env.PWD || __dirname;

  //if we are being run as an npm module, then use the parent path instead.
  if (__dirname.indexOf('node_modules') !== -1) {
    workingDir = (__dirname.split('/node_modules'))[0];
  }

  return workingDir;
}