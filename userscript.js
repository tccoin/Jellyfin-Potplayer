// ==UserScript==
// @name         Jellyfin with Potplayer
// @version      0.1
// @description  play video with Potplayer
// @author       Tccoin
// @match        http://localhost:8096/jellyfin/web/index.html
// ==/UserScript==

(function() {
  'use strict';
  let openPotplayer = (itemid) => {
    let userid = (await ApiClient.getCurrentUser()).Id;
    ApiClient.getItem(userid, itemid).then(r => {
      if (r.Path) {
        let path = r.Path.replace(/\\/g, '/');
        //path = path.replace('D:', 'Z:');
        console.log(path);
        window.open('potplayer://' + path)
      } else {
        ApiClient.getItems(userid, itemid).then(r => openPotplayer(r.Items[0].Id));
      }
    })
  };

  let bindEvent = async() => {
    let buttons = [];
    let retry = 6 + 1;
    while (buttons.length == 0 && retry > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      buttons = document.querySelectorAll('[data-mode=play],[data-mode=resume],[data-action=resume]');
      retry -= 1;
    }
    for (let button of buttons) {
      let nextElementSibling = button.nextElementSibling;
      let parentElement = button.parentElement;
      let outerHTML = button.outerHTML;
      button.parentElement.removeChild(button);
      let newButton = document.createElement('button');
      if (nextElementSibling) {
        parentElement.insertBefore(newButton, nextElementSibling);
      } else {
        parentElement.append(newButton);
      }
      newButton.outerHTML = outerHTML;
    }
    buttons = document.querySelectorAll('[data-mode=play],[data-mode=resume]');
    for (let button of buttons) {
      button.removeAttribute('data-mode');
      button.addEventListener('click', e => {
        e.stopPropagation();
        let itemid = /id=(.*?)&serverId/.exec(window.location.hash)[1];
        openPotplayer(itemid);
      });
    }
    buttons = document.querySelectorAll('[data-action=resume]');
    for (let button of buttons) {
      button.removeAttribute('data-action');
      button.addEventListener('click', e => {
        e.stopPropagation();
        let item = e.target;
        while (!item.hasAttribute('data-id')) { item = item.parentNode }
        let itemid = item.getAttribute('data-id');
        openPotplayer(itemid);
      });
    }
  };

  let lazyload = () => {
    let items = document.querySelectorAll('[data-src].lazy');
    let y = document.scrollingElement.scrollTop;
    let intersectinglist = [];
    for (let item of items) {
      let windowHeight = document.body.offsetHeight;
      let itemTop = item.getBoundingClientRect().top;
      let itemHeight = item.offsetHeight;
      if (itemTop + itemHeight >= 0 && itemTop <= windowHeight) {
        intersectinglist.push(item);
      }
    }
    for (let item of intersectinglist) {
      item.style.setProperty('background-image', `url("${item.getAttribute('data-src')}")`);
      item.classList.remove('lazy');
      item.removeAttribute('data-src');
    };
  };

  window.addEventListener('scroll', lazyload);

  window.addEventListener('viewshow', async() => {
    bindEvent();
    window.addEventListener('hashchange', bindEvent);
  });
})();