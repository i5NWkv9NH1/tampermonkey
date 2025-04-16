// ==UserScript==
// @name         @sora/东方财富#CPI数据
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.3
// @description  东方财富CPI数据
// @match        https://data.eastmoney.com/cjsj/cpi.html
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoCpiBtn {
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #ff7676 0%, #ff9068 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255,118,118,0.3);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.2s;
}
#nekoCpiBtn::after {
  content: "▶";
  margin-left: 5px;
  font-size: 12px;
}
#nekoCpiBtn.copied {
  background: linear-gradient(135deg, #6c5ce7 0%, #a363d9 100%);
}
`);

(function() {
    'use strict';

    // 智能表头映射器
    const headerMap = [
        '月份',
        '全国当月', '全国同比', '全国环比', '全国累计',
        '城市当月', '城市同比', '城市环比', '城市累计',
        '农村当月', '农村同比', '农村环比', '农村累计'
    ];

    const extractData = () => {
        const table = document.querySelector('.table-model');
        if (!table) throw new Error('表格未找到');

        let output = [];
        // 构建CSV头
        output.push(headerMap.join(','));

        // 遍历数据行
        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                // 智能清洗数据
                let text = td.innerText.replace(/\s+/g, '');
                // 处理颜色标签
                const span = td.querySelector('span');
                return span ? span.textContent : text;
            });

            // 数据验证
            if (cells.length !== 13) return;

            // 重组数据结构
            const formatted = [
                cells[0], // 月份
                ...cells.slice(1,5),  // 全国数据
                ...cells.slice(5,9),  // 城市数据
                ...cells.slice(9,13)  // 农村数据
            ].map(v => v.replace(/%$/, '')); // 统一去除百分号

            output.push(formatted.join(','));
        });

        return output.join('\n');
    };

    // 创建猫耳按钮
    const btn = document.createElement('button');
    btn.id = 'nekoCpiBtn';
    btn.textContent = 'CPI数据采集';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        try {
            const data = extractData();
            GM_setClipboard(data);

            // 反馈动画
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 800);

        } catch(e) {
            alert('ฅ(๑⊙д⊙๑)ฅ 数据抓取失败，请刷新页面重试');
            console.error('CPI采集错误:', e);
        }
    });
})();
