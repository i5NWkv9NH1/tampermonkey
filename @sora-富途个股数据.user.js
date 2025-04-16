// ==UserScript==
// @name         @sora/富途#个股数据
// @namespace    https://i5nwkv9nh1.github.io/
// @version      0.1
// @description  一键复制富途个股页面数据
// @author       Sora
// @match        https://www.futunn.com/stock/*
// @match        https://www.futunn.com/*/stock/*
// @exclude      https://www.futunn.com/stock/*/options*
// @icon         https://www.google.com/s2/favicons?domain=www.futunn.com
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 添加自定义样式
    GM_addStyle(`
        .ft-copy-btn {
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 9999;
            padding: 10px 15px;
            border: none;
            border-radius: 25px;
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            color: white;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
        }
        .ft-copy-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        .ft-copy-btn:active {
            transform: translateY(0);
        }
        .ft-copy-btn::before {
            content: "🐾";
            margin-right: 8px;
            font-size: 16px;
        }
        .ft-copy-btn.copied {
            background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
        }
        .ft-copy-btn.copied::after {
            content: "✓ 已复制";
        }
    `);

    // 等待DOM加载完成
    window.addEventListener('load', function() {
        // 创建按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'ft-copy-btn';
        copyBtn.textContent = '复制个股数据';
        document.body.appendChild(copyBtn);

        // 按钮点击事件
        copyBtn.addEventListener('click', function() {
            // 获取股票基本信息
            const stockName = document.querySelector('.stock-info-component .name')?.textContent.trim() || '未知股票';
            const priceElement = document.querySelector('.stock-info-component .price-current .price');
            const price = priceElement?.textContent.trim() || '未知价格';
            const changeElement = document.querySelector('.stock-info-component .price-current .change-price');
            const change = changeElement?.textContent.trim() || '未知变化';
            const changeRatioElement = document.querySelector('.stock-info-component .price-current .change-ratio');
            const changeRatio = changeRatioElement?.textContent.trim() || '未知变化率';
            const statusElement = document.querySelector('.stock-info-component .status span');
            const status = statusElement?.textContent.trim() || '未知状态';

            // 获取详细卡片信息
            const highPrice = document.querySelector('.detail-card .card-item:nth-child(1) span:nth-child(1)')?.textContent.trim() || '未知';
            const lowPrice = document.querySelector('.detail-card .card-item:nth-child(2) span:nth-child(1)')?.textContent.trim() || '未知';
            const volume = document.querySelector('.detail-card .hidden .card-item:nth-child(3) span:nth-child(1)')?.textContent.trim() || '未知';
            const openPrice = document.querySelector('.detail-card .hidden .card-item:nth-child(4) span:nth-child(1)')?.textContent.trim() || '未知';
            const prevClose = document.querySelector('.detail-card .hidden .card-item:nth-child(5) span:nth-child(1)')?.textContent.trim() || '未知';
            const turnover = document.querySelector('.detail-card .hidden .card-item:nth-child(6) span:nth-child(1)')?.textContent.trim() || '未知';

            // 获取资金流向数据
            const inflow = document.querySelector('.cash-flow-bar .all-in b')?.textContent.trim() || '未知';
            const outflow = document.querySelector('.cash-flow-bar .all-out b')?.textContent.trim() || '未知';
            const superIn = document.querySelector('.cash-flow-bar .line-item:nth-child(2) .in-item span')?.textContent.trim() || '未知';
            const superOut = document.querySelector('.cash-flow-bar .line-item:nth-child(2) .out-item span')?.textContent.trim() || '未知';
            const bigIn = document.querySelector('.cash-flow-bar .line-item:nth-child(3) .in-item span')?.textContent.trim() || '未知';
            const bigOut = document.querySelector('.cash-flow-bar .line-item:nth-child(3) .out-item span')?.textContent.trim() || '未知';
            const midIn = document.querySelector('.cash-flow-bar .line-item:nth-child(4) .in-item span')?.textContent.trim() || '未知';
            const midOut = document.querySelector('.cash-flow-bar .line-item:nth-child(4) .out-item span')?.textContent.trim() || '未知';
            const smallIn = document.querySelector('.cash-flow-bar .line-item:nth-child(5) .in-item span')?.textContent.trim() || '未知';
            const smallOut = document.querySelector('.cash-flow-bar .line-item:nth-child(5) .out-item span')?.textContent.trim() || '未知';

            // 构建要复制的文本
            const textToCopy = `
【${stockName}】基本信息
当前价格: ${price} (${change}, ${changeRatio})
状态: ${status}
最高价: ${highPrice} | 最低价: ${lowPrice}
成交量: ${volume} | 成交额: ${turnover}
今开: ${openPrice} | 昨收: ${prevClose}

【资金流向】
总流入: ${inflow}万 | 总流出: ${outflow}万
特大单: 流入 ${superIn}万 | 流出 ${superOut}万
大单: 流入 ${bigIn}万 | 流出 ${bigOut}万
中单: 流入 ${midIn}万 | 流出 ${midOut}万
小单: 流入 ${smallIn}万 | 流出 ${smallOut}万
`;

            // 复制到剪贴板
            GM_setClipboard(textToCopy, 'text');

            // 显示复制成功状态
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    });
})();