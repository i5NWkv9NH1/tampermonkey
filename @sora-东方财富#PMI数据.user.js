// ==UserScript==
// @name         @sora/东方财富#PMI数据
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.3
// @description  东方财富PMI数据智能采集+多行业对比
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @match        https://data.eastmoney.com/cjsj/pmi.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoPmiBtn {
  position: fixed;
  top: 160px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,184,148,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoPmiBtn::after {
  content: "📊";
  margin-left: 5px;
}
#nekoPmiBtn.copied::after {
  content: "✅";
}
`);

(function() {
    'use strict';

    // 表头智能转换
    const headerMap = [
        '月份',
        '制造业指数', '制造业同比',
        '非制造业指数', '非制造业同比'
    ];

    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('PMI表格未找到喵~');

        let output = [];
        output.push(headerMap.join(','));

        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map((td, index) => {
                // 智能处理增长符号
                if ([2,4].includes(index)) { // 同比增长列
                    const span = td.querySelector('span');
                    const isNegative = span?.classList.contains('green');
                    let value = span?.textContent.replace(/%/g, '') || '';
                    return value ? (isNegative ? `-${value}` : value) : '';
                }
                return td.textContent.trim().replace(/\s+/g, '');
            });

            // 数据完整性校验（5列转4列）
            if (cells.length !== 5) return;
            const filteredData = [cells[0], cells[1], cells[2], cells[4]];

            output.push(filteredData.join(','));
        });

        return output.join('\n');
    };

    // 创建猫耳按钮
    const btn = document.createElement('button');
    btn.id = 'nekoPmiBtn';
    btn.textContent = 'PMI数据采集';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data, 'text');

            // 交互反馈
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 1000);

        } catch(e) {
            alert('ฅ(๑*д*๑)ฅ!! 数据抓取失败，请检查页面结构');
            console.error('PMI采集错误:', e);
        }
    });

    // 自动检测表格加载
    new MutationObserver(() => {
        if (document.querySelector('#cjsj_table')) {
            btn.style.display = 'block';
        }
    }).observe(document, { childList: true, subtree: true });
})();
