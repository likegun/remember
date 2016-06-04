(function() {
  document.addEventListener('DOMContentLoaded', () => {
    var libScript = document.createElement('script');
    libScript.type = 'text/javascript';
    libScript.src = './lib.js';
    document.body.appendChild(libScript);
  });

  window.unsave = (unsaveArr) => {
    getStorageWebsites()
      .then((websites) => {
        console.log(websites);
        unsaveArr.forEach((url) => delete websites[url]);
        console.log(websites);
        return setStorageWebsites(websites);
      });
  };
})();
