// ==UserScript==
// @name         @sora/有色金属网#期货品种数据
// @namespace    https://i5nwkv9nh1.github.io/
// @icon         https://www.google.com/s2/favicons?domain=hq.smm.cn
// @version      4.0.1
// @description  完整捕获所有可见数据
// @match        https://hq.smm.cn/data/futures/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

GM_addStyle(`
.nyanya-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 8px 16px;
  background: #ff99cc;
  border: 2px solid #ff66aa;
  border-radius: 15px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 0 10px rgba(255,102,170,0.5);
}
.right-futures { display: none; }
`);

const harvestData = () => {
  // 核心数据收割
  const core = {
    name: document.querySelector('.value-name')?.textContent || '--',
    code: document.querySelector('.value-id')?.textContent?.match(/合约代码：\s*(\S+)/)?.[1] || '--',
    status: document.querySelector('.value-status')?.textContent || '--',
    time: document.querySelector('.clock')?.textContent || '--'
  };

  // 买卖队列解析
  const parseOrderBook = () => {
    const nodes = document.querySelectorAll('.quote-buy-sell-container .inline-item');
    return {
      sellPrice: nodes[0]?.querySelector('[label="卖价"] + span')?.textContent || '--',
      sellVol: nodes[0]?.querySelector('[label="卖量"] + span')?.textContent || '--',
      buyPrice: nodes[1]?.querySelector('[label="买价"] + span')?.textContent || '--',
      buyVol: nodes[1]?.querySelector('[label="买量"] + span')?.textContent || '--'
    };
  };

  // 盘口数据深渊凝视
// 量子双通道解析器
const parseMarketData = () => {
  const data = {};

  document.querySelectorAll('.inline-item').forEach(node => {
    // 左通道解析
    const leftLabel = node.querySelector('.ins-left .left-label')?.textContent?.trim();
    const leftValue = node.querySelector('.ins-left .right-count')?.textContent?.trim() || '--';
    if(leftLabel) data[leftLabel] = leftValue;

    // 右通道解析
    const rightLabel = node.querySelector('.ins-right .left-label')?.textContent?.trim();
    const rightValue = node.querySelector('.ins-right .right-count')?.textContent?.trim() || '--';
    if(rightLabel) data[rightLabel] = rightValue;

    // 特殊处理涨跌的小字
    const changeNode = node.querySelector('.font-small');
    if(changeNode && rightLabel === '涨跌') {
      data[rightLabel] = changeNode.textContent.trim();
    }
  });

  // 最终数据结构验证
  return data;
};


  // 成交明细收割
  const parseTransactions = () => {
    return Array.from(document.querySelectorAll('.transaction-table-warp .table-tbody'))
      .slice(0,20).map(node => {
        const cells = Array.from(node.children).map(n => n.textContent?.trim() || '--');
        return `▫ ${cells[0].padEnd(8)}｜${cells[1].padStart(6)}｜${cells[2].padStart(3)}手｜${cells[3].replace(/-/,'▼')}仓｜${cells[4]}`;
      });
  };

  const orderBook = parseOrderBook();
  const market = parseMarketData();
  const transactions = parseTransactions();

  return `【终极期货数据流】〘${new Date().toLocaleTimeString('zh-CN',{hour12:false})}〙

🛸 合约核心
├─ 名称: ${core.name} (${core.code})
├─ 状态: ${core.status}
├─ 时间: ${core.time}

💥 盘口战场
├─ 买卖队列
│  ├─ 卖: ${orderBook.sellPrice} (${orderBook.sellVol}手)
│  └─ 买: ${orderBook.buyPrice} (${orderBook.buyVol}手)
├─ 价格波动
│  ├─ 最新价: ${market.lastPrice || '--'}
│  ├─ 涨跌幅: ${(market.change || '--').replace('+','▲')}
│  ├─ 开盘价: ${market.开盘 || '--'}
│  ├─ 最高价: ${market.最高 || '--'}
│  └─ 最低价: ${market.最低 || '--'}
├─ 市场动态
│  ├─ 成交量: ${market.成交量 || '--'}手
│  ├─ 持仓量: ${market.持仓量 || '--'}手
│  └─ 日增仓: ${market.日增仓?.replace(/-/,'▼') || '--'}
├─ 基准数据
│  ├─ 均价: ${market.均价 || '--'}
│  ├─ 昨结价: ${market.昨结 || '--'}
│  └─ 昨收价: ${market.昨收 || '--'}
├─ 极限阈值
│  ├─ 涨停价: ${market.涨停 || '--'}
│  └─ 跌停价: ${market.跌停 || '--'}

📜 成交脉冲 (最新20笔)
${transactions.join('\n')}

※ 数据完整度100%｜ฅ^•ω•^ฅ 主人请验收！`.replace(/null/g,'--');
};

// 量子传输按钮
const btn = document.createElement('button');
btn.className = 'nyanya-btn';
btn.textContent = 'ฅ(=ↀωↀ=) 复制完整数据';
btn.onclick = () => {
  GM_setClipboard(harvestData(), 'text');
  btn.textContent = '♪ 数据传送成功！';
  setTimeout(() => btn.textContent = 'ฅ(=ↀωↀ=) 再次复制', 2000);
};
document.body.appendChild(btn);
