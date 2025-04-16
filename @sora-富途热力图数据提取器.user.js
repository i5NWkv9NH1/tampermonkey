// ==UserScript==
// @name         @sora/富途热力图数据提取器
// @namespace    https://i5nwkv9nh1.github.io/
// @version      1.4
// @description  一键提取富途热力图板块和个股数据，优化数据格式化
// @author       CatNyu
// @match        https://www.futunn.com/heatmap*
// @icon         https://www.futunn.com/favicon.ico
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==


(function() {
    'use strict';

    // 创建悬浮按钮
    const btn = document.createElement('button');
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        padding: '8px 16px',
        background: '#007AFF',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    });
    btn.textContent = '📋 复制数据';
    document.body.appendChild(btn);

    // 数据处理逻辑
    btn.onclick = function() {
        let output = [];
        const sectors = document.querySelectorAll('.stock-treemap-item');

        sectors.forEach(sector => {
            // 提取板块信息
            const sectorNameElem = sector.querySelector('.industry-title');
            if (!sectorNameElem) return;

            const sectorName = sectorNameElem.textContent.trim();
            const sectorChangeElem = sector.querySelector('.industry-change');
            const sectorChange = sectorChangeElem ? sectorChangeElem.textContent.trim() : '0';

            // 提取有效个股
            const stocks = [];
            sector.querySelectorAll('.cell text tspan:nth-of-type(1)').forEach(stockElem => {
                const name = stockElem.textContent.trim();
                const changeElem = stockElem.nextElementSibling;
                const change = changeElem ? changeElem.textContent.trim() : '';

                if (name && change && !['/', 'N/A', ''].includes(change)) {
                    stocks.push(`${name} ${change}`);
                }
            });

            // 只保留有有效个股的板块
            if (stocks.length > 0) {
                output.push(`${sectorName} ${sectorChange} ${stocks.join(' ')}`);
            }
        });

        // 压缩格式并复制
        const finalText = output.join(' ');
        GM_setClipboard(finalText, 'text');
        btn.textContent = '✅ 已复制！';
        setTimeout(() => btn.textContent = '📋 复制数据', 1500);
    };
})();
