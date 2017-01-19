/**
 * Public interface for team projects, makes it easy to import
 */
import * as utils from 'lib/basicUtils';
import * as info from 'lib/info';
import * as mgr from 'lib/optionsManager';
import * as requireRunner from 'lib/runner/require';

exports = {
  "utils" : utils,
  "info" : info,
  "mgr" : mgr,
  "runner" : {
    "require" : requireRunner
  }
};