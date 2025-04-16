// ==UserScript==
// @name         @sora/东方财富#货币供应量
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.4
// @description  货币供应量M2/M1/M0数据智能采集+科学计数法转换
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @match        https://data.eastmoney.com/cjsj/hbgyl.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoMoneyBtn {
  position: fixed;
  top: 220px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(46,204,113,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoMoneyBtn::after {
  content: "💰";
  margin-left: 5px;
}
#nekoMoneyBtn.copied {
  background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
}
`);

(function() {
    'use strict';

    // 表头映射（手动处理合并表头）
    const headerMap = [
        '月份',
        'M2数量(亿元)', 'M2同比', 'M2环比',
        'M1数量(亿元)', 'M1同比', 'M1环比',
        'M0数量(亿元)', 'M0同比', 'M0环比'
    ];

    const scientificToNumber = (str) => {
        // 处理科学计数法 3.26e6 → 3260000
        if(/e/i.test(str)) {
            const [num, exp] = str.split('e');
            return Number(num) * Math.pow(10, exp);
        }
        return str;
    };

    const extractData = () => {
        const table = document.querySelector('#cjsj_table .table-model');
        if (!table) throw new Error('货币供应量表格未找到');

        let output = [];
        output.push(headerMap.join(','));

        table.querySelectorAll('tbody tr').forEach(tr => {
            // 过滤分页行
            if(tr.id.includes('pagetual_pageBar')) return;

            const cells = Array.from(tr.querySelectorAll('td')).map((td, index) => {
                let text = td.textContent.replace(/,/g, '').trim();

                // 首列月份处理
                if(index === 0) return text.replace(/\s+/g, '');

                // 数值型数据处理
                const span = td.querySelector('span');
                text = span ? span.textContent : text;

                // 特殊值处理
                if(text === '-' || text === '') return 'NULL';
                if(/^\d+\.?\d*亿$/.test(text)) return text.replace('亿','');

                // 转换科学计数法
                return scientificToNumber(text.replace(/[%\s]/g, ''));
            });

            // 严格校验10列数据
            if(cells.length !== 10) return;

            output.push(cells.join(','));
        });

        return output.join('\n');
    };

    // 创建货币按钮
    const btn = document.createElement('button');
    btn.id = 'nekoMoneyBtn';
    btn.textContent = '货币数据采集';
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
            console.error('货币供应量采集错误:', e);
        }
    });
})();
