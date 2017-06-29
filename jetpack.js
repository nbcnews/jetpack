/**
 * Public interface for team projects, makes it easy to import
 */
import * as utils from './lib/basicUtils';
import * as mgr from './lib/optionsManager';
import requirelib from './lib/runner/requirelib';

(function(window) {
  window.jetpack = window.jetpack || {};
  window.jetpack.bundles =  window.jetpack.bundles || [];
  window.jetpack.bundles.push({
    "site": JETPACK_SITE,
    "v": JETPACK_VERSION,
    "path": JETPACK_PUBLIC_PATH,
    "project": JETPACK_PROJECT
  });
  utils.log('jetpack ' + JETPACK_PROJECT + ' = ' + JETPACK_VERSION);
})(window);

export default {
  "utils" : utils,
  "mgr": mgr,
  "requirelib" : requirelib
};
