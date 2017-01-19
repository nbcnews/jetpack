import * as info from 'lib/info';

export function extend() {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        arguments[0][key] = arguments[i][key];
    }
  }

  return arguments[0];
}

/**
 * iterative test for defined
 * @param varString
 * @returns {boolean}
 */
export function fancyIsDefined(varString) {
  var parts = varString.split('.');
  var ref = window;
  var next = null;
  for (var p = 0; p < parts.length; p++) {
    next = parts[p];
    if (typeof ref[next] === 'undefined') {
      return false;
    }

    ref = ref[next];
  }

  return true;
}
