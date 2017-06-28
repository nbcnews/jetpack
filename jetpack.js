/**
 * Public interface for team projects, makes it easy to import
 */
import * as utils from './lib/basicUtils';
import * as mgr from './lib/optionsManager';
import requirelib from './lib/runner/requirelib';
import { getBundle, getBundles } from './lib/helpers/getBundle';

(function(window) {
  window.jetpack = window.jetpack || {};
  window.jetpack.bundles =  window.jetpack.bundles || [];
  window.jetpack.bundles.push({
    "site": JETPACK_SITE,
    "v": JETPACK_VERSION,
    "path": JETPACK_PUBLIC_PATH
  });
  utils.log('jetpack ' + JETPACK_SITE + " = " + JETPACK_VERSION);
})(window);

export default {
  "utils" : utils,
  "mgr": mgr,
  "requirelib" : requirelib,
  "getBundle": getBundle,
  "getBundles": getBundles,
};
