//run uglifyjs lib/devRedirectSnippet.js -o lib/devRedirectSnippet_min.js

window.jpcheck = function (root) {
  var bundlePath = null;
  var COOKIE = 'jetpack_dev_path';

  function setCookie (cvalue) {
    document.cookie = COOKIE + '=' + encodeURIComponent(cvalue) + ' ;path=/'; //session, no expiration
  }

  function getCookie () {
    var name = COOKIE + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return decodeURIComponent(c.substring(name.length, c.length));
      }
    }
    return 0;
  }

  try {
    var urlParts = window.location.href.split('jetpack=');
    var path = null;
    if (urlParts.length > 1) {
      path = urlParts[1].split('&')[0];
      path && setCookie(path);
    }

    var cval = getCookie();
    if (cval) {
      bundlePath = root + cval;
      window.location.hash = 'jetpack=' + cval;
      var script = document.createElement('script');
      script.src = bundlePath;
      script.async = 'async';
      document.getElementsByTagName('head')[0].appendChild(script);
    }

    return bundlePath;
  } catch (ex) {
    console.log(ex);
  }
};
