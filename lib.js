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
