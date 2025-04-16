// ==UserScript==
// @name         @sora/东方财富#GDP数据
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.5
// @description  东方财富GDP数据
// @match        https://data.eastmoney.com/cjsj/gdp.html
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoGdpBtn {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #3eb489 0%, #4fffb0 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(62,180,137,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoGdpBtn::after {
  content: "⇩";
  margin-left: 5px;
}
#nekoGdpBtn.copied {
  background: linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%);
}
`);

(function() {
    'use strict';

    // 智能表头映射
    const headerMap = [
        '季度',
        'GDP绝对值(亿元)', 'GDP同比',
        '第一产业绝对值(亿元)', '第一产业同比',
        '第二产业绝对值(亿元)', '第二产业同比',
        '第三产业绝对值(亿元)', '第三产业同比'
    ];

    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('GDP表格未找到');

        let output = [];
        output.push(headerMap.join(','));

        table.querySelectorAll('tbody tr').forEach(tr => {
            // 过滤分页行
            if(tr.id.includes('pagetual_pageBar') || tr.querySelector('td[colspan]')) return;

            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                // 智能提取数值
                const span = td.querySelector('span');
                let text = span ? span.textContent : td.textContent;
                return text.replace(/[%\s]/g, '');
            });

            // 数据校验（9列：季度+4个产业×2）
            if(cells.length !== 9) return;

            output.push(cells.join(','));
        });

        return output.join('\n');
    };

    // 创建猫爪按钮
    const btn = document.createElement('button');
    btn.id = 'nekoGdpBtn';
    btn.textContent = 'GDP数据采集';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data);

            // 按钮动效
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 800);

        } catch(e) {
            alert('ฅ(๑òᆺó๑)ฅ 数据抓取失败，请检查页面结构');
            console.error('GDP采集错误:', e);
        }
    });
})();
