// ==UserScript==
// @name         @sora/东财#成交榜单
// @version      1.0
// @namespace    i5NWkv9NH1.github.io
// @icon         https://www.google.com/s2/favicons?domain=data.eastmoney.com
// @description  一键复制沪深港通四个交易榜单数据
// @match        https://data.eastmoney.com/hsgtV2/hsgtDetail/sdcjg.html
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==


(function () {
    'use strict';

    // 插入样式：按钮+隐藏导航tab
    const style = document.createElement('style');
    style.innerText = `
        .copy-hsgt-data-btn {
            position: fixed;
            top: 160px;
            right: 20px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            border: none;
            border-radius: 25px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
        }

        /* 隐藏底部tab（成交榜 / 数据 / 行情 / 股吧） */
        .thead
    `;
    document.head.appendChild(style);

    // 创建按钮
    const btn = document.createElement('button');
    btn.innerText = '📋复制数据';
    btn.className = 'copy-hsgt-data-btn';
    document.body.appendChild(btn);

    // 需要抓取的四个表格 ID
    const ids = ['dataview_hgt', 'dataview_sgt', 'dataview_ggth', 'dataview_ggts'];

    btn.addEventListener('click', () => {
        let result = '';

        ids.forEach(id => {
            const wrapper = document.getElementById(id);
            if (!wrapper) return;

            const title = wrapper.closest('.sdcjg')?.querySelector('.title')?.innerText || '';
            result += title + '\n';

            const thead = wrapper.querySelector('thead');
            const tbody = wrapper.querySelector('tbody');

             let skipIndex = -1;

            if (thead) {
                const ths = Array.from(thead.querySelectorAll('th'));
                const headers = ths.map((th, index) => {
                    const text = th.innerText.trim();
                    if (text === '相关链接') skipIndex = index;
                    return text;
                }).filter((_, idx) => idx !== skipIndex); // 跳过“相关链接”那列
                result += headers.join('\t') + '\n';
            }

            if (tbody) {
                const rows = Array.from(tbody.querySelectorAll('tr'));
                rows.forEach(row => {
                    const tds = Array.from(row.querySelectorAll('td'));
                    const cells = tds
                        .map(td => td.innerText.trim())
                        .filter((_, idx) => idx !== skipIndex); // 同样跳过那列
                    result += cells.join('\t') + '\n';
                });
            }

            result += '\n';
        });

        GM_setClipboard(result);
        btn.innerText = '✅已复制';
        setTimeout(() => {
            btn.innerText = '📋复制数据';
        }, 3000);
    });
})();
