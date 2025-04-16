// ==UserScript==
// @name         @sora/东方财富#信贷数据
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.1
// @description  信贷数据精准采集(支持负值和大额数值)
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @match        https://data.eastmoney.com/cjsj/xzxd.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoLoanBtn {
  position: fixed;
  top: 220px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(76,175,80,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoLoanBtn::after {
  content: "💵";
  margin-left: 5px;
}
#nekoLoanBtn.copied::after {
  content: "✅";
}
`);

(function() {
    'use strict';

    // 表头映射（6列结构）
    const headerMap = [
        '月份',
        '当月(亿元)',
        '同比增长',
        '环比增长',
        '累计(亿元)',
        '累计同比增长'
    ];

    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('表格定位失败喵~');

        let output = [];
        output.push(headerMap.join(','));

        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                // 智能处理特殊符号和大数值
                const span = td.querySelector('span');
                let text = (span || td).textContent
                    .replace(/%/g, '')       // 移除百分号
                    .replace(/\s+/g, '')     // 清除空格
                    .replace(/,/g, '');      // 移除千分位分隔符

                // 特殊值处理（负增长/超大数值）
                if (text === '-') return 'NULL';
                if (text.includes('.')) return parseFloat(text).toFixed(2);
                return isNaN(text) ? text : parseFloat(text);
            });

            // 严格校验6列数据
            if (cells.length !== 6) return;

            output.push(cells.join(','));
        });

        return output.join('\n');
    };

    // 创建猫爪按钮
    const btn = document.createElement('button');
    btn.id = 'nekoLoanBtn';
    btn.textContent = '信贷数据采集';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data);

            // 交互反馈
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 1000);

        } catch(e) {
            alert('ฅ(๑*д*๑)ฅ 抓取失败，请刷新页面后重试喵~');
            console.error('信贷采集错误:', e);
        }
    });
})();
