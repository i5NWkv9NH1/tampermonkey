// ==UserScript==
// @name         @sora/东方财富#股票交易统计
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.5
// @description  沪深两市交易数据智能采集+累计行过滤
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @match        https://data.eastmoney.com/cjsj/gpjytj.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoStockBtn {
  position: fixed;
  top: 260px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(155,89,182,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoStockBtn::after {
  content: "📈";
  margin-left: 5px;
}
#nekoStockBtn.copied {
  background: linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%);
}
`);

(function() {
    'use strict';

     const headerMap = [
        '日期',
        '发行总股本_上海(亿股)', '发行总股本_深圳(亿股)',
        '市价总值_上海(亿元)', '市价总值_深圳(亿元)',
        '成交金额_上海(亿元)', '成交金额_深圳(亿元)',
        '成交量_上海(亿股)', '成交量_深圳(亿股)',
        '最高指数_上海', '最高指数_深圳',
        '最低指数_上海', '最低指数_深圳'
    ];
    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('表格定位失败');
        let output = [];
        output.push(headerMap.join(','));
        table.querySelectorAll('tbody tr').forEach(tr => {
            // 严格过滤逻辑：空行+累计行+异常行
            if (!tr.children || tr.children.length === 0) return; // 过滤空<tr></tr>
            const firstTd = tr.querySelector('td:first-child');
            if (!firstTd || firstTd.textContent.includes('累计')) return;
            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                // 优化数据提取：同时处理普通td和span数据
                const contentNode = td.querySelector('span') || td;
                let text = contentNode.textContent.replace(/,/g, '').trim();
                return text === '-' || text === '' ? 'NULL' : text;
            });
            // 严格校验12列结构
            if (cells.length !== 12) return;

            output.push(cells.join(','));
        });
        return output.join('\n');
    };


    const btn = document.createElement('button');
    btn.id = 'nekoStockBtn';
    btn.textContent = '交易数据采集';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data);

            // 交互反馈
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 800);

        } catch(e) {
            alert('ฅ(๑•̀д•́ฅ) 数据抓取失败，请检查表格结构');
            console.error('股票交易采集错误:', e);
        }
    });
})();
