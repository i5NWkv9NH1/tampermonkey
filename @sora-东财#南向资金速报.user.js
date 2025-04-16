// ==UserScript==
// @name         @sora/东财#南向资金速报
// @namespace    https://i5nwkv9nh1.github.io/
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @version      1.3
// @description  一键获取实时+历史南向资金数据
// @match        https://data.eastmoney.com/hsgt/hsgtV2.html
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

GM_addStyle(`
#southCatBtn {
  position: fixed;
  top: 160px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font: 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: 0.3s;
}
`);

(function() {
  'use strict';
  document.querySelector('#emsider').remove()

  const btn = document.createElement('button');
  btn.id = 'southCatBtn';
  btn.textContent = '🚀 南向速报';
  document.body.appendChild(btn);

  // 增强数据清洗函数
  const sanitize = (text) => text.replace(/\s+/g, ' ')
    .replace(/[\u00A0]/g, '')
    .replace(/(元|亿元|万亿)/g, '')
    .trim();

  // 智能数据提取器
  const extractSection = (containerId, isHistory) => {
    const container = document.getElementById(containerId);
    if (!container) return [];

    return Array.from(container.querySelectorAll('li.btE4E4E4')).map(li => {
      const name = li.querySelector('.blockColor + span')?.textContent.trim() || '未知';
      const spans = Array.from(li.querySelectorAll('span:not(.blockColor)'));

      // 实时数据模式
      if (!isHistory) {
        const jme = spans.find(s => s.textContent.includes('净买额'))?.nextElementSibling?.textContent;
        const mre = spans.find(s => s.textContent.includes('买入额'))?.nextElementSibling?.textContent;
        const mce = spans.find(s => s.textContent.includes('卖出额'))?.nextElementSibling?.textContent;
        return { name, jme, mre, mce };
      }

      // 历史数据模式
      const month = spans.find(s => s.textContent.includes('近一月'))?.nextElementSibling?.textContent;
      const total = spans.find(s => s.textContent.includes('历史'))?.nextElementSibling?.textContent;
      return { name, month, total };
    });
  };

  btn.addEventListener('click', async () => {
    // 获取实时数据
    const realTime = extractSection('south_jme_data');
    // 获取历史数据
    const history = extractSection('south_history_data', true);

    // 构建输出内容
    const output = [
      '【南向资金速报】',
      '📊 实时交易数据',
      ...realTime.map(d =>
        `▸ ${d.name.padEnd(6)} 净买额: ${sanitize(d.jme)}亿 | ` +
        `买入额: ${sanitize(d.mre)}亿 | 卖出额: ${sanitize(d.mce)}亿`
      ),
      '\n📜 历史累计数据',
      ...history.map(d =>
        `▸ ${d.name.padEnd(6)} 近一月: ${sanitize(d.month)}亿 | ` +
        `历史累计: ${sanitize(d.total)}万亿`
      ),
      '\n※ 数据源: 东方财富网 | 单位: 人民币'
    ].join('\n');

    GM_setClipboard(output, 'text').then(() => {
      btn.style.transform = 'scale(1.1)';
      setTimeout(() => btn.style.transform = '', 300);
    });
  });
})();
