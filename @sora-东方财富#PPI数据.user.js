// ==UserScript==
// @name         @sora/东方财富#PPI数据
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.2
// @description  东方财富PPI数据智能采集+标准化输出
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @match        https://data.eastmoney.com/cjsj/ppi.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoPpiBtn {
  position: fixed;
  top: 140px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #6c5ce7 0%, #a363d9 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(108,92,231,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoPpiBtn::after {
  content: "📋";
  margin-left: 5px;
}
#nekoPpiBtn.copied::after {
  content: "✅";
}
`);

(function() {
    'use strict';

    // 表头映射
    const headerMap = ['月份', '当月', '同比增长', '累计'];

    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('PPI表格未找到');

        let output = [];
        output.push(headerMap.join(','));

        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                // 智能提取核心数据
                const span = td.querySelector('span');
                return span
                    ? span.textContent.replace(/%/g, '')
                    : td.textContent.replace(/\s+/g, '');
            });

            // 数据校验（4列）
            if (cells.length !== 4) return;

            output.push(cells.join(','));
        });

        return output.join('\n');
    };

    // 创建猫爪按钮
    const btn = document.createElement('button');
    btn.id = 'nekoPpiBtn';
    btn.textContent = 'PPI数据采集';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data);

            // 交互反馈
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 1000);

        } catch(e) {
            alert('ฅ(๑*д*๑)ฅ 数据抓取失败，请确认页面加载完成');
            console.error('PPI采集错误:', e);
        }
    });
})();
