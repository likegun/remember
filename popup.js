(function() {
  'use strict';
  var saveBtn = document.getElementById('save');
  var goBtn = document.getElementById('go');
  var websitesUl = document.getElementById('websites');
  var background = chrome.extension.getBackgroundPage();
  var unsaveArr = [];

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

  var tabsSelect = (condition) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(condition || null, (tabs) => resolve(tabs));
    });
  };

  var getCurrentTab = () => {
    return tabsSelect({'active': true, 'lastFocusedWindow': true})
            .then((tabs) => tabs[0]);
  };

  var getBodyScrollTop = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.executeScript(null, {
        code: 'document.body.scrollTop'
      }, (ret) => resolve(ret[0]));
    });
  };

  var scroll = (scrollTop) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.executeScript(null, {
        code: `document.body.scrollTop=${scrollTop}`
      });
    });
  };

  var save = () => {
    Promise.all([getStorageWebsites(), getCurrentTab(), getBodyScrollTop()])
      .then(([websites, tab, scrollTop]) => {
        websites[tab.url] = {
          title: tab.title,
          scrollTop: scrollTop
        };
        return setStorageWebsites(websites);
      })
      .then(() => showLatestWebsites());
  };

  var unsave = (event) => {
    var unsaveBtn = event.currentTarget;
    unsaveArr.push(unsaveBtn.website);
    unsaveBtn.innerHTML = 'Bak';
    unsaveBtn.id = 'revoke';
    unsaveBtn.parentNode.childNodes[0].style.color = 'grey';
    unsaveBtn.parentNode.childNodes[0].style['text-decoration'] = 'line-through';
    unsaveBtn.removeEventListener('click', unsave);
    unsaveBtn.addEventListener('click', revoke);
  };

  var revoke = (event) => {
    var revokeBtn = event.currentTarget;
    var revokeUrl = revokeBtn.website;
    unsaveArr = unsaveArr.filter((url) => url !== revokeUrl);
    revokeBtn.innerHTML = 'Del';
    revokeBtn.id = 'unsave';
    revokeBtn.parentNode.childNodes[0].style.color = 'blue';
    revokeBtn.parentNode.childNodes[0].style['text-decoration'] = 'none';
    revokeBtn.removeEventListener('click', revoke);
    revokeBtn.addEventListener('click', unsave);
  };

  var go = () => {
    console.log(unsaveArr);
    Promise.all([getStorageWebsites(), getCurrentTab()])
            .then(([websites, tab]) => {
              if(websites[tab.url] !== undefined)
                scroll(websites[tab.url].scrollTop);
            });
  };

  var showLatestWebsites = () => {
    while(websitesUl.firstChild)
      websitesUl.removeChild(websitesUl.firstChild);
    getStorageWebsites()
      .then((websites) => {
        Object.keys(websites || {}).forEach((url) => {
          let li = document.createElement('li');
          let a = document.createElement('a');
          a.href = url;
          a.innerHTML = websites[url].title;
          a.target = '_blank';
          li.appendChild(a);
          let unsaveBtn = document.createElement('button');
          unsaveBtn.type = 'button';
          unsaveBtn.id = 'unsave';
          unsaveBtn.innerHTML = 'Del';
          unsaveBtn.website = url;
          unsaveBtn.addEventListener('click', unsave);
          li.appendChild(unsaveBtn);
          websitesUl.appendChild(li);
        });
      });
  };

  document.addEventListener('DOMContentLoaded', function () {
    saveBtn.addEventListener('click', save);
    goBtn.addEventListener('click', go);
    window.addEventListener('unload', function() {
      background.unsave(unsaveArr);
    });
    showLatestWebsites();
  });
})();
