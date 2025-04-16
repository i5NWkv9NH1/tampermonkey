// ==UserScript==
// @name         @sora/PalmMicro#基金数据提取
// @namespace    https://i5nwkv9nk1.github.io/
// @version      2.0
// @description  全量数据采集+智能格式化输出
// @icon         https://www.google.com/s2/favicons?domain=palmmicro.com
// @match        https://palmmicro.com/woody/res/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#nekoFullCopyBtn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  font: bold 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: all 0.3s;
}
#nekoFullCopyBtn.copied {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
#nekoFullCopyBtn.error {
  background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
}
`);

(function() {
    'use strict';

    const tableMapper = {
        // 定义所有需要采集的表格及其显示名称
        'estimationtable': '核心估值数据',
        'referencetable': '参考市场数据',
        'tradingtable': '五档交易数据',
        'SZ164824calibrationhistorytable': '校准记录',
        'smatabletable': '均线分析',
        'SZ164824fundhistorytable': '基金历史',
        'fundsharetable': '份额换手',
        'INDAnvclosehistorytable': 'INDA净值'
    };
        const btn = document.createElement('button');
        btn.id = 'nekoFullCopyBtn';
        btn.innerHTML = '📋 全量数据采集';
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            try {
                let output = [];

                // 基础信息
                output.push(`# ${document.querySelector('h1').textContent.trim()}`);
                output.push(`🕒 数据时间：${document.getElementById('time').textContent.trim()}\n`);

                // 遍历所有定义表格
                Object.entries(tableMapper).forEach(([tableId, tableName]) => {
                    const table = document.getElementById(tableId);
                    if (!table) return;

                    output.push(`## ${tableName}`);

                    // 处理表头
                    const headers = Array.from(table.querySelectorAll('th')).map(th => {
                        return th.textContent.replace(/<\/?font[^>]*>/g, '').trim();
                    });
                    output.push('| ' + headers.join(' | ') + ' |');
                    output.push('|' + headers.map(() => '---').join('|') + '|');

                    // 处理数据行
                    table.querySelectorAll('tbody tr').forEach(tr => {
                        const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                            return td.textContent.replace(/<\/?font[^>]*>/g, '').trim();
                        });
                        output.push('| ' + cells.join(' | ') + ' |');
                    });

                    output.push(''); // 空行分隔
                });

                // 附加特殊字段
                const specialData = [
                    `对冲建议值：${document.querySelector('b > font[color="navy"]').textContent}`,
                    `最新汇率：${document.querySelector('#referencetable tr:last-child td:nth-child(2)').textContent}`
                ];
                output.push('\n## 关键指标\n' + specialData.join('\n'));

                GM_setClipboard(output.join('\n'));

                // 反馈动画
                btn.classList.add('copied');
                setTimeout(() => btn.classList.remove('copied'), 1000);

            } catch(e) {
                btn.classList.add('error');
                setTimeout(() => btn.classList.remove('error'), 1000);
                console.error('全量采集失败:', e);
            }
        });
})();
