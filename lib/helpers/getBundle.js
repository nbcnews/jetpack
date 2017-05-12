export function getBundle(scriptSrc) {
  fetch(scriptSrc).then((scriptResponse) => {
    return scriptResponse.text();
  }).then((scriptText) => {
    return appendScript(scriptText);
  }).catch((err) => {
    console.log(err);
  });
}

export function getBundles(scriptURLs) {
  Promise.all(scriptURLs.map((url) => {
      return fetch(url).then((response) => {
        return response.text();
      });
    })
  ).then((scripts) => {
    scripts.forEach((script) => {
      appendScript(script.substring(0, script.length - 1));
    });
  });
}

function appendScript(script) {
  let newScript = document.createElement('script');
  newScript.innerText = script;
  document.body.appendChild(newScript);
}
