// ==UserScript==
// @name         @sora/华尔街见闻#快讯
// @namespace    i5NWkv9NH1.github.io
// @icon         https://www.google.com/s2/favicons?domain=wallstreetcn.com
// @version      1.3
// @description  极简模式一键提取实时消息
// @match        https://wallstreetcn.com/live/global
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

GM_addStyle(`
#nekoMasterBtn {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font: 14px/1.5 'Microsoft YaHei';
  border: none;
}
`);

function init() {
  const btn = document.createElement('button');
  btn.id = 'nekoMasterBtn';
  btn.textContent = '🐱 极速提取';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    const items = document.querySelectorAll('.live-item');
    let output = [];

    items.forEach(item => {
      const time = item.querySelector('.live-item_created')?.textContent.replace(/\s/g, '');
      const title = item.querySelector('.live-item_title')?.textContent.replace(/\s+/g, ' ');
      const content = Array.from(item.querySelectorAll('.live-item_html p'))
        .map(p => p.textContent.replace(/\s+/g, ' '))
        .join(' ');

      output.push(
        [time, title, content]
          .filter(Boolean)
          .join(' ')
          .trim()
      );
    });

    const compressedText = output.join('\n').replace(/\n+/g, '\n');

    GM_setClipboard(compressedText, 'text').then(() => {
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 200);
    });
  });
}

(function() {
  'use strict';
  init();
})();
