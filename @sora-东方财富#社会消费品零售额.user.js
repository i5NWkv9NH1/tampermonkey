// ==UserScript==
// @name         @sora/东方财富#社会消费品零售额
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.3
// @description  社会消费品零售额数据智能采集+缺失值处理
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @match        https://data.eastmoney.com/cjsj/xfp.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoXfpBtn {
  position: fixed;
  top: 180px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #ff7f50 0%, #ffb347 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255,127,80,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoXfpBtn::after {
  content: "🐾";
  margin-left: 5px;
}
#nekoXfpBtn.copied {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff9f43 100%);
}
`);

(function() {
    'use strict';

    // 表头映射
    const headerMap = [
        '月份', '当月(亿元)', '同比增长',
        '环比增长', '累计(亿元)', '累计同比'
    ];

    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('数据表格未找到');

        let output = [];
        output.push(headerMap.join(','));

        table.querySelectorAll('tbody tr').forEach(tr => {
            // 过滤分页行
            if(tr.id.includes('pagetual_pageBar')) return;

            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                // 智能处理缺失值和百分比
                const span = td.querySelector('span');
                let text = span ? span.textContent : td.textContent;
                return text.replace(/[%\s]/g, '') || 'NULL';
            });

            // 严格校验6列数据
            if(cells.length !== 6) return;

            output.push(cells.join(','));
        });

        return output.join('\n');
    };

    // 创建猫爪按钮
    const btn = document.createElement('button');
    btn.id = 'nekoXfpBtn';
    btn.textContent = '零售数据采集';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data);

            // 交互反馈
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 800);

        } catch(e) {
            alert('ฅ(๑•д•๑)ฅ 数据抓取失败，请刷新页面重试');
            console.error('零售数据采集错误:', e);
        }
    });
})();
