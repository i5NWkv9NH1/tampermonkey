// ==UserScript==
// @name         @sora/东方财富#外汇黄金储备
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.0
// @description  外汇与黄金储备数据精准采集
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @match        https://data.eastmoney.com/cjsj/hjwh.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoForexBtn {
  position: fixed;
  top: 180px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #FF7F50 0%, #FF6B6B 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255,107,107,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoForexBtn::after {
  content: "🪙";
  margin-left: 5px;
}
#nekoForexBtn.copied::after {
  content: "✅";
}
`);

(function() {
    'use strict';

    // 表头映射（7列结构）
    const headerMap = [
        '月份',
        '外汇储备_数值(亿美元)', '外汇储备_同比', '外汇储备_环比',
        '黄金储备_数值(亿美元)', '黄金储备_同比', '黄金储备_环比'
    ];

    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('表格定位失败喵~');

        let output = [];
        output.push(headerMap.join(','));

        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                // 智能提取带颜色的数据
                const span = td.querySelector('span');
                let text = (span || td).textContent
                    .replace(/%/g, '')      // 移除百分号
                    .replace(/\s+/g, '');   // 清除空格
                return text === '-' ? 'NULL' : text;
            });

            // 严格校验7列数据
            if (cells.length !== 7) return;

            output.push(cells.join(','));
        });

        return output.join('\n');
    };

    // 创建猫爪按钮
    const btn = document.createElement('button');
    btn.id = 'nekoForexBtn';
    btn.textContent = '外汇黄金采集';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data);

            // 交互反馈
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 1000);

        } catch(e) {
            alert('ฅ(◕︿◕✿)ฅ 抓取失败，请确认页面加载完毕喵~');
            console.error('外汇黄金采集错误:', e);
        }
    });
})();
