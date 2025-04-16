// ==UserScript==
// @name         @sora/富途期权全数据
// @namespace    https://i5nwkv9nh1.github.io/
// @version      2.1
// @description  全字段期权数据采集工具
// @icon         https://www.google.com/s2/favicons?domain=www.futunn.com
// @match        https://www.futunn.com/stock/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 猫尾样式优化
    GM_addStyle(`
        .sora-full-btn {
            position: fixed;
            right: 20px;
            top: 50px;
            z-index: 9999;
            padding: 12px 24px;
            background: linear-gradient(135deg, #89f7fe, #66a6ff);
            border: none;
            border-radius: 15px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s;
            font-family: 'Microsoft YaHei', sans-serif;
        }
        .sora-full-btn::after {
            content: '🐈';
            margin-left: 8px;
        }
        .sora-full-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102,166,255,0.4);
        }
    `);

    // 深度数据采集
    function collectFullOptionData() {
        // 标的资产信息
        const stockBar = document.querySelector('.stock-bar');
        const baseInfo = {
            symbol: stockBar?.querySelector('.text:nth-child(1)')?.textContent.trim(),
            name: stockBar?.querySelector('.text:nth-child(2)')?.textContent.replace(':', '').trim(),
            price: stockBar?.querySelector('.text.direct-up')?.textContent.trim(),
            change: stockBar?.querySelectorAll('.text.direct-up')[1]?.textContent.trim(),
            ratio: stockBar?.querySelectorAll('.text.direct-up')[2]?.textContent.trim()
        };

        // 到期日与波动率
        const dates = Array.from(document.querySelectorAll('.date-item'))
            .map(el => el.textContent.trim().replace(/\s+/g, ''));
        const volRatio = document.querySelector('.ratio.hight-light')?.textContent.trim();

        // 三维数据矩阵构建
        const strikePrices = Array.from(document.querySelectorAll('.middle-grid-item'))
            .map(el => el.textContent.trim());

        // Call数据解析
        const callRows = Array.from(document.querySelectorAll('.left .table-row'));
        const callData = callRows.map(row => {
            const cells = Array.from(row.querySelectorAll('.grid-item'));
            return {
                oi: cells[0]?.textContent.trim(),      // 未平仓
                turnover: cells[1]?.textContent.trim(), // 成交额
                volume: cells[2]?.textContent.trim(),   // 成交量
                change: cells[3]?.textContent.trim(),   // 涨跌额
                ratio: cells[4]?.textContent.trim(),    // 涨跌幅
                last: cells[5]?.textContent.trim(),     // 最新价
                bid: cells[6]?.textContent.split('x')[0].trim(), // 买价
                ask: cells[7]?.textContent.split('x')[0].trim()  // 卖价
            };
        });

        // Put数据解析
        const putRows = Array.from(document.querySelectorAll('.right .table-row'));
        const putData = putRows.map(row => {
            const cells = Array.from(row.querySelectorAll('.grid-item'));
            return {
                bid: cells[0]?.textContent.split('x')[0].trim(), // 买价
                ask: cells[1]?.textContent.split('x')[0].trim(), // 卖价
                last: cells[2]?.textContent.trim(),     // 最新价
                ratio: cells[3]?.textContent.trim(),    // 涨跌幅
                change: cells[4]?.textContent.trim(),   // 涨跌额
                volume: cells[5]?.textContent.trim(),   // 成交量
                turnover: cells[6]?.textContent.trim(), // 成交额
                oi: cells[7]?.textContent.trim()        // 未平仓
            };
        });

        // 构建专业级输出
        let output = `【📊 ${baseInfo.name} 期权全数据】\n`;
        output += `标的：${baseInfo.symbol} ${baseInfo.price} (${baseInfo.change} ${baseInfo.ratio})\n`;
        output += `波动率：${volRatio} | 到期日：${dates.join(' → ')}\n\n`;

        output += '行权价 │ Call[买/卖/最新/涨跌/幅/OI/量/额] │ Put[买/卖/最新/涨跌/幅/OI/量/额]\n';
        output += '───────┼───────────────────────────────────┼──────────────────────────────────\n';

        strikePrices.forEach((strike, index) => {
            const call = callData[index] || {};
            const put = putData[index] || {};
            output += `${strike.padEnd(6)} │ ` +
                `${call.bid?.padEnd(4) || '--'}/${call.ask?.padEnd(4) || '--'} ` +
                `${call.last?.padEnd(5) || '--'} ${call.change?.padEnd(5) || '--'} ` +
                `${call.ratio?.padEnd(6) || '--'} ${call.oi?.padEnd(4) || '--'} ` +
                `${call.volume?.padEnd(3) || '--'}/${call.turnover?.padEnd(5) || '--'} │ ` +
                `${put.bid?.padEnd(4) || '--'}/${put.ask?.padEnd(4) || '--'} ` +
                `${put.last?.padEnd(5) || '--'} ${put.change?.padEnd(5) || '--'} ` +
                `${put.ratio?.padEnd(6) || '--'} ${put.oi?.padEnd(4) || '--'} ` +
                `${put.volume?.padEnd(3) || '--'}/${put.turnover?.padEnd(5) || '--'}\n`;
        });

        return output;
    }

    // 创建专业级按钮
    const btn = document.createElement('button');
    btn.className = 'sora-full-btn';
    btn.textContent = '复制完整数据';
    btn.onclick = () => {
        btn.textContent = '采集中...';
        setTimeout(() => {
            try {
                const data = collectFullOptionData();
                GM_setClipboard(data);
                btn.textContent = '复制成功！';
            } catch (err) {
                btn.textContent = '采集失败！';
            }
            setTimeout(() => btn.textContent = '复制完整数据', 1500);
        }, 300);
    };

    document.body.appendChild(btn);
})();
