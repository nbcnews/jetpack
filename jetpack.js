/**
 * Public interface for team projects, makes it easy to import
 */
import * as utils from 'lib/basicUtils';
import * as info from 'lib/info';
import * as mgr from 'lib/optionsManager';
import requirelib from 'lib/runner/requirelib';

export default {
  "utils" : utils,
  "info" : info,
  "mgr": mgr,
  "requirelib" : requirelib
};
