(function() {
  var getStorageWebsites = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('websites', (ret) => resolve(ret.websites || {}));
    });
  };

  var setStorageWebsites = (websites) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({websites}, () => (resolve()));
    });
  };

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
