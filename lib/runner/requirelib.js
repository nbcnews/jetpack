import * as utils from '../basicUtils';
import * as info from '../info';

/**
 * Pass in a list of window scoped object names that must exist prior to running the callback.
 * Use this for checking if browser libraries are present.
 * Similar to using requireJS define, but it assumes the dependencies are loaded elsewhere.
 * @param dependencyList
 * @param callback
 */
export default function(dependencyList, callback) {
  var loadedModules = [];
  var requiredCnt = dependencyList.length;
  var MAX_WAITS = 16;//4 seconds
  var INTERVAL = 250;
  var times = 0;

  /**promiselike**/
  var handlers = {
    success: function (/*output*/) {
    },
    fail: function (err) {
      info.log(err);
    }
  };

  function checkAllAndRun() {

    if (loadedModules.length == requiredCnt) {
      var l;
      var allgood = true;
      //make sure we have everything
      for (l = 0; l < loadedModules.length; l++) {
        if (loadedModules[l] === null) {
          allgood = false;
        }
      }

      if (allgood || (times == MAX_WAITS)) { //run anyway, even if not everything is loaded
        if (times == MAX_WAITS) {
          handlers.fail('running with missing modules');
        }
        checkAllAndRun = function () {
        }; //run only once
        checkAndWait = function () {
        }; //run only once

        //TODO:: resolve promise with return value from callback
        setTimeout(function () {
          handlers.success(callback.apply(null, loadedModules));
        }, 0);
      }
    }
  }

  var i;

  function checkAndWait(dep, i) {
    if (utils.fancyIsDefined(dep)) {
      loadedModules[i] = window[dep];
      info.log(dep + ' loaded');
      checkAllAndRun();
    } else {
      loadedModules[i] = null;
      if (times < MAX_WAITS) {
        setTimeout(function () {
          checkAndWait(dep, i);
        }, INTERVAL);
        times++;
      } else {
        info.log(dep + ' not loaded');
        checkAllAndRun();
      }
    }
  }

  for (i = 0; i < requiredCnt; i++) {
    checkAndWait(dependencyList[i], i);
  }

  return handlers;
}
