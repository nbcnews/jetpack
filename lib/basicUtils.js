export function extend() {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        arguments[0][key] = arguments[i][key];
      }
    }
  }

  return arguments[0];
}

/**
 * iterative test for defined
 * @param varString
 * @returns {boolean}
 */
export function fancyIsDefined(varString, scope) {
  var parts = varString.split('.');
  var ref = scope;
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

export function log(msg) {
  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    console.log(msg);
  }
}

export function getScript(src, onSuccess){
  var script = document.createElement('script');
  script.src = src;
  script.async = 'async';

  if(typeof onSuccess === 'function'){
    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState === "loaded" || script.readyState === "complete") {
          script.onreadystatechange = null;
          onSuccess();
        }
      };
    } else {
      script.onload = function() {
        onSuccess();
      };
    }
  }
  document.getElementsByTagName('head')[0].appendChild(script);
}