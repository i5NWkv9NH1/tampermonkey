// ==UserScript==
// @name         @sora/同花顺超#全数据采集
// @namespace    https://i5nwkv9nh1.github.io/
// @icon         https://www.google.com/s2/favicons?domain=10jqka.com.cn
// @version      3.0
// @description  完美支持所有技术指标+完整资金数据
// @match        https://stockpage.10jqka.com.cn/*/
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

GM_addStyle(`
.right-float, .ad-dimonsion, [id^="stock_ad"] {display:none!important;}
#nekoMasterBtn {
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 99999;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16);
  font: 14px/1.5 'Microsoft YaHei';
  transition: all 0.3s;
}
`);

(function() {
    'use strict';

    // 彻底移除广告元素
    document.querySelectorAll('.right-float, .ad-dimonsion, [id^="stock_ad"]').forEach(el => el.remove());

    // 创建主按钮
    const btn = document.createElement('div');
    btn.id = 'nekoMasterBtn';
    btn.innerHTML = '📊 一键采集';
    document.body.appendChild(btn);

btn.onclick = async () => {
    btn.innerHTML = '🔄 采集中...';
    try {
        const [realTimeData, klineData, fundData, dealDetail, fiveGear] = await Promise.all([
            getRealTimeData(),
            getKlineData(),
            parseFundData(),
            parseDealDetail(),  // 新增成交明细
            parseFiveGear()      // 新增五档盘口
        ]);
        console.log(dealDetail)
        console.log(fiveGear)
        GM_setClipboard(buildOutput({
            ...realTimeData,
            ...klineData,
            ...fundData,
            dealDetail,          // 注入新数据
            fiveGear
        }), 'text');

        btn.innerHTML = '✅ 采集成功！';
    } catch(e) {
        btn.innerHTML = '❌ 采集失败';
        console.error(e);
    }
    setTimeout(() => btn.innerHTML = '📊 一键采集', 2000);
};


    // 实时数据获取
    function getRealTimeData() {
        const iframe = document.querySelector('iframe[name="ifm"]');
        if (!iframe) return {};
        const doc = iframe.contentDocument;

        return {
            name: document.querySelector('#stockNamePlace').innerText.replace('\n', ' '),
            open: text(doc, '#topenprice'),
            high: text(doc, '#thighprice'),
            low: text(doc, '#tlowprice'),
            close: text(doc, '#hexm_curPrice'),
            volume: text(doc, '#tamount'),
            amount: text(doc, '#tamounttotal'),
            change: text(doc, '#tchange'),
            marketValue: text(doc, '#tvalue'),
            pbRatio: text(doc, '#tvaluep'),
            peRatio: text(doc, '#fvaluep'),
            trange: text(doc, '#trange'),
        };
    }

    // K线技术指标
    async function getKlineData() {
        const iframe = document.querySelector('iframe:not([name])');
        if (!iframe) return {};
        const doc = iframe.contentDocument;

        // 切换到日K线
        clickTab(doc, '.hxc3-trgger-box li:nth-child(2) a');
        await wait(800);


        const ma = await parseTechData(doc, '.hxc3-hxc3KlinePricePane-hover-ma', 'MA')
        const macd = await parseTechData(doc, '.hxc3-TechMACDPane-hover', 'MACD')

        const rsi = await switchTechTab(doc, 'RSI')
        const boll = await switchTechTab(doc, 'BOLL')

        return {
    //        ...parseTechData(doc, '.hxc3-hxc3KlinePricePane-hover-ma', 'MA'),
    //        ...parseTechData(doc, '.hxc3-TechMACDPane-hover', 'MACD'),
    //        ...switchTechTab(doc, 'RSI'),
    //        ...switchTechTab(doc, 'BOLL'),
            ...ma,
            ...macd,
            ...rsi,
            ...boll
        };
    }

    // 通用数据解析
// 修改后的技术指标切换函数
async function switchTechTab(doc, tabName) {
    // 精准匹配data-indexname属性
    const tab = [...doc.querySelectorAll('.techswicth a')]
        .find(a => a.dataset.indexname === tabName);
    console.log('tabName', tabName)

    if (tab) {
        // 先取消所有激活状态
        doc.querySelectorAll('.techswicth li').forEach(li =>
            li.classList.remove('active')
        );
        // 点击目标选项卡并添加激活状态
        tab.parentElement.classList.add('active');
        tab.click();
    }

    // 特殊处理WR的class名不一致问题
    const selector = tabName === 'WR' ?
        'hxc3-TechWRPane-hover' :
        `.hxc3-Tech${tabName}Pane-hover`;
    console.log('selector', selector)

    return parseTechData(doc, selector, tabName);
}

// 优化后的通用数据解析
function parseTechData(doc, selector, prefix) {
    const el = doc.querySelector(selector);
   if (!el) {
        console.warn('元素未找到:', selector);
        return {};
    }

    // 处理MACD特殊结构
    if (prefix === 'MACD') {
        const values = el.innerText.match(/[-+]?\d+\.\d+/g) || [];
        return {
            [`${prefix}_MACD`]: values[0] || 'N/A',
            [`${prefix}_DIFF`]: values[1] || 'N/A',
            [`${prefix}_DEA`]: values[2] || 'N/A'
        };
    }

    // 通用键值解析
    const arr = Array.from(el.children).reduce((res, span) => {
        const match = span.innerText.match(/(\w+):\s*(-?\d+\.?\d*)/);
        if (match) res[`${prefix}_${match[1]}`] = match[2];
        return res;
    }, {});
    console.log('arr', arr)
    return arr
}


    // 资金数据解析
    function parseFundData() {
        const root = document.querySelector('#gegugp_zjjp');
        if (!root) return {};

        // 主力资金
        const fund = {
            inflow: text(root, '#zjlxzlr'),
            outflow: text(root, '#zjlxzlc'),
            net: text(root, '#zjlxzlje')
        };

        // 大中小单
        root.querySelectorAll('tbody tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            const type = tds[0].innerText.trim();
            fund[`${type}In`] = tds[1].innerText.replace(/\D/g, '');
            fund[`${type}Out`] = tds[2].innerText.replace(/\D/g, '');
        });

        // 历史资金
        fund.history5d = text(document, '#history_funds_analysis_free .cred');
        fund.control = text(document, '.zjlxlstj_txt[title]');

        return fund;
    }

// 解析成交明细数据
function parseDealDetail() {
  const tbody = document.querySelector('.ri_table tbody');
  if (!tbody) return [];

  return Array.from(tbody.querySelectorAll('tr')).reduce((arr, tr) => {
    const tds = tr.querySelectorAll('td');
    // 有效性校验：至少需要4列且不含"--"
    if (tds.length ===4 && ![tds[0],tds[1],tds[2]].some(td => td?.innerText?.includes('-'))) {
      arr.push({
        time: tds[0].innerText.trim(),
        price: parseFloat(tds[1].innerText),
        volume: parseInt(tds[2].innerText),
        type: tds[3].innerText.replace(/[^买入卖出]/g,'') || '未知'
      });
    }
    return arr;
  }, []);
}


// 解析五档盘口数据
function parseFiveGear() {
  const container = document.querySelector('#newsright_stocknews_table');
  if (!container) return { sell:[], buy:[], outer:0, inner:0 };

  const isValidNum = str => !isNaN(parseFloat(str)) && str !== '-';

  const parseGear = selector =>
    Array.from(container.querySelectorAll(selector)).slice(0,5).map(tr => {
      const priceCell = tr.querySelector('td:nth-child(2)');
      const volCell = tr.querySelector('td:last-child');
      return {
        price: isValidNum(priceCell?.innerText) ? parseFloat(priceCell.innerText) : null,
        volume: isValidNum(volCell?.innerText) ? parseInt(volCell.innerText) : null
      };
    }).filter(v => v.price !== null && v.volume !== null);

  return {
    sell: parseGear('table.m_table_6 tr:not(.bordert)'),
    buy: parseGear('table.m_table_6 tr.bordert ~ tr'),
    // 修复这里的两处括号不闭合问题 ↓
    outer: parseInt(container.querySelector('.plus')?.innerText || 0, 10) || 0,
    inner: parseInt(container.querySelector('.minus')?.innerText || 0, 10) || 0
  };
}


    // 工具函数
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const text = (doc, selector) => (doc.querySelector(selector)?.innerText || 'N/A').trim();
    const clickTab = (doc, selector) => doc.querySelector(selector)?.click();

    // 输出构建
function buildOutput(data) {
  // 预处理五档数据
  const formatGear = (gear, prefix) => {
  if (prefix === '卖') {
     return gear.reverse().map((v,i) =>
      v.price ? `${prefix}${i+1}：${v.volume}手@${v.price}` : `--`
    ).join('\n') || '无有效数据'
  }
    return gear.map((v,i) =>
      v.price ? `${prefix}${i+1}：${v.volume}手@${v.price}` : `--`
    ).join('\n') || '无有效数据'
}


  // 获取有效买卖盘
  const sellGears = data.fiveGear.sell || [];
  const buyGears = data.fiveGear.buy || [];
  const hasSell = sellGears.length > 0;
  const hasBuy = buyGears.length > 0;

  return `📈【实时行情】
股票：${data.name}
今开：${data.open}  最高：${data.high}
最低：${data.low}  现价：${data.close}
成交量：${data.volume}  成交额：${data.amount}
换手率：${data.change}  振幅：${data.trange}
📊【技术指标】
MA5：${data.MA_MA5}  MA10：${data.MA_MA10}  MA30：${data.MA_MA30}
MACD：${data.MACD_MACD}  DIFF：${data.MACD_DIFF}  DEA：${data.MACD_DEA}
RSI6：${data.RSI_RSI6}  RSI12：${data.RSI_RSI12} RSI24: ${data.RSI_RSI24}
BOLL: UPPER：${data.BOLL_MID}  MID：${data.BOLL_UPPER} LOWER: ${data.BOLL_LOWER}
💰【资金监控】
净流入：${data.net}万（大单：+${data.大单In - data.大单Out}万）
近5日累计：${data.history5d}万
控盘情况：${data.control || '无异常'}

🎯【盘口异动】${data.fiveGear.sell[0].price > data.close ? '卖压聚集' : '买盘活跃'}
🎯【全档盘口】
卖盘：
${hasSell ? formatGear(sellGears, '卖') : '无有效卖盘'}
-----
买盘：
${hasBuy ? formatGear(buyGears, '买') : '无有效买盘'}

📌【最新成交】
${
  data.dealDetail?.length
  ? data.dealDetail.map(v =>
      `${v.time||'--'} ${v.type||'--'} ${v.volume||'--'}手 @${v.price||'--'}`
    ).join('\n')
  : '-- 暂无有效成交 --'
}

⏰ ${new Date().toLocaleString().replace(/:\d{2}$/,'')} ฅ(=•ω＜=)⌒☆`;
}

})();
