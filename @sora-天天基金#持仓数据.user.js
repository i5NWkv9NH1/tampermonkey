// ==UserScript==
// @name         @sora/天天基金#持仓数据
// @namespace    https://i5nwkv9nk1.github.io/
// @version      1.0
// @description  自动提取基金成分股实时涨跌数据，支持一键复制
// @match        https://fundf10.eastmoney.com/*
// @icon         https://www.google.com/s2/favicons?domain=fundf10.eastmoney.com
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#neko-export-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
  padding: 8px 15px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
#neko-export-btn:hover {
  background: #4096ff;
}
`);

(function() {
    'use strict';

    // 智能数据提取器
    const extractFundData = () => {
        const result = [];
        const table = document.querySelector('.w782.comm.tzxq');
        if (!table) return null;

        // 提取表头
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => {
            return th.innerText.replace(/\n.*/, ''); // 去除换行内容
        }).filter(text => !['相关资讯'].includes(text)); // 排除不需要的列

        // 提取数据行
        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).filter(td =>
                !td.classList.contains('xglj') // 过滤资讯列
            );

            const rowData = cells.map((td, index) => {
                let content = td.innerText.trim();
                // 特殊处理股票代码
                if (index === 1) {
                    const link = td.querySelector('a')?.href;
                    const code = link?.match(/r\/(\d+\.\d+)/)?.[1] || content;
                    return code.split('.')[1]; // 提取纯数字代码
                }
                // 处理涨跌颜色
                if (index === 4) {
                    const isDown = td.querySelector('.die');
                    return isDown ? `-${content}` : content;
                }
                return content;
            }).slice(0, headers.length); // 对齐列数

            result.push(rowData);
        });

        return { headers, data: result };
    }

    // 生成可复制文本
    const formatData = (data) => {
        const csvHeader = data.headers.join('\t');
        const csvBody = data.data.map(row => row.join('\t')).join('\n');
        return `${csvHeader}\n${csvBody}`;
    }

    // 添加操作按钮
    const addControlButton = () => {
        if (document.getElementById('neko-export-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'neko-export-btn';
        btn.textContent = '📋 复制持仓数据';
        btn.onclick = () => {
            const data = extractFundData();
            if (!data) return alert('未检测到持仓表格喵~');

            GM_setClipboard(formatData(data), 'text').then(() => {
                btn.textContent = '✅ 复制成功！';
                setTimeout(() => btn.textContent = '📋 复制持仓数据', 2000);
            });
        };
        document.body.appendChild(btn);
    }

    // 智能监听表格加载
    new MutationObserver((mutations) => {
        if (document.querySelector('.w782.comm.tzxq')) {
            addControlButton();
        }
    }).observe(document, {
        childList: true,
        subtree: true
    });

    // 初始化检测
    if (document.readyState === 'complete') {
        addControlButton();
    } else {
        window.addEventListener('load', addControlButton);
    }
})();
