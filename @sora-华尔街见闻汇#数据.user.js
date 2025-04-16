// ==UserScript==
// @name         @sora/华尔街见闻汇#数据
// @namespace    http://sorachandesu.moe
// @icon         https://www.google.com/s2/favicons?domain=wallstreetcn.com
// @version      1.0
// @description  一键提取实时数据
// @match        https://wallstreetcn.com/markets/codes/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

GM_addStyle(`
#forexCatBtn {
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font: 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: transform 0.2s;
}
#forexCatBtn:hover {
  transform: translateY(-2px);
}
`);

(function() {
  'use strict';

  const btn = document.createElement('button');
  btn.id = 'forexCatBtn';
  btn.textContent = '📈 抓取汇率';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    // 基础信息抓取
    const productName = document.querySelector('.prod-name .cn')?.textContent.replace(/\s/g, '') || '未知品种';
    const productCode = document.querySelector('.prod-name .en')?.textContent.replace(/[()\s]/g, '');
    const price = document.querySelector('.price-lastpx')?.textContent.replace(/\s/g, '');
    const change = document.querySelector('.price-precision')?.textContent.replace(/\s/g, '');
    const changeRate = document.querySelector('.price-rate')?.textContent.replace(/[()\s]/g, '');
    const status = document.querySelector('.status')?.textContent.replace(/[，\s]/g, '');
    const updateTime = document.querySelector('.date')?.textContent.replace(/\s+/g, ' ');

    // 详细信息抓取
    const details = Array.from(document.querySelectorAll('.block-info-item')).map(item => {
      return item.textContent
        .replace(/\s+/g, ' ')
        .replace(/：/g, ':')
        .trim()
        .replace(/(\d) (\d)/g, '$1$2'); // 修复数字间的异常空格
    });

    // 格式化输出
    const output = [
      `【${productName}${productCode ? ` ${productCode}` : ''}】`,
      `➤ 最新价: ${price} ${change} ${changeRate}`,
      `➤ 状态: ${status} @ ${updateTime}`,
      '➤ 详细信息:',
      ...details.map(d => `  • ${d}`)
    ].join('\n');

    GM_setClipboard(output, 'text').then(() => {
      btn.style.background = 'linear-gradient(135deg, #80ff72 0%, #7ee8fa 100%)';
      setTimeout(() => {
        btn.style.background = 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)';
      }, 800);
    });
  });
})();
