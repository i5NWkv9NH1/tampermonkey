// ==UserScript==
// @name         @sora/雪球#个股数据
// @version      1.4
// @namespace    https://i5nwkv9nh1.github.io/
// @icon         https://www.google.com/s2/favicons?domain=xueqiu.com
// @description  智能适配雪球全品种数据抓取
// @match        https://xueqiu.com/S/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

GM_addStyle(`

#chart_ad, .ad-right-aside { display: none !important; }
   .nav { height: 64px;  position: static; }
  .container-lg {
  height: calc(100vh - 64px);
    justify-content: center;
    display: grid;
    grid-template-columns: auto auto auto; /* 三列等宽 */
    gap: 16px;
    padding: 1rem;
  }
  .editor-wrapper {
display: flex;
    flex-direction: column;
    gap: 1rem;
}

.nav__placeholder { display: none }
  .stock__main { margin: unset; padding-top: 0; }

  .stock__side, .footer { display: none; }
  .stock-links { width: auto; float: unset; margin: unset;  padding-top: 0; }
  .editor-container, .stock-timeline { padding-top: 0; }
  .stock-timeline { padding-top: unset; margin-bottom: 0; min-height: unset; height: auto; }
  .status-list { max-height: calc(100vh - 16px - 320px - 64px); overflow-y: scroll; }
#xueqiuCatBtn {
  position: fixed;
  top: 200px;
  right: 20px;
  z-index: 99999;
  background: linear-gradient(135deg, #6B48FF 0%, #00D1FF 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font: 14px/1.5 'Microsoft YaHei';
  border: none;
  transition: 0.3s;
}
`);

(function() {
  'use strict';

  const btn = document.createElement('button');
  btn.id = 'xueqiuCatBtn';
  btn.textContent = '❄️ 雪球速报';
  document.body.appendChild(btn);

  // 增强型数据清洗器
  const dataSanitizer = (text) => text
    .replace(/\s+/g, ' ')
    .replace(/[\u00A0]/g, '')
    .replace(/([%‰‱])(\d)/g, '$1 $2')
    .replace(/[：]/g, ':') // 统一中文冒号为英文
    .trim();

  // 优化后的核心数据提取器
  const extractStockData = (container) => {
    const result = {};

    // 基础信息
    result.name = dataSanitizer(document.querySelector('.stock-name')?.textContent || '未知品种');
    result.price = container.querySelector('.stock-current strong')?.textContent.replace(/[¥￥]/g, '') || '--';

    // 改进涨跌幅解析
    const changeText = container.querySelector('.stock-change')?.textContent || '';
    const cleanChange = dataSanitizer(changeText)
      .replace(/[()]/g, '') // 去除可能存在的括号
      .replace(/([+-])(\d)/g, '$1 $2'); // 增加符号与数字间距
    const [change, changeRate] = cleanChange.split(' ');
    result.change = change || '--';
    result.changeRate = (changeRate || '--').replace(/%/g, ''); // 去除百分号

    // 市场状态
    result.status = container.querySelector('.quote-market-status span:first-child')?.textContent || '--';
    result.time = container.querySelector('.quote-market-status span:nth-child(2)')?.textContent.trim() || '--';

    // 增强表格数据提取
    result.details = {};
    container.querySelectorAll('.quote-info tr').forEach(tr => {
      const tds = Array.from(tr.querySelectorAll('td'));
      for (let i=0; i<tds.length; i++) {
        const rawText = dataSanitizer(tds[i].textContent);
        const colonIndex = rawText.indexOf(':'); // 统一用英文冒号判断
        if (colonIndex > -1) {
          const key = rawText.slice(0, colonIndex).replace(/:+$/, '');
          const value = rawText.slice(colonIndex+1);
          if (key && value) result.details[key] = value;
        }
      }
    });

    return result;
  };

  btn.addEventListener('click', () => {
    const output = [];

    document.querySelectorAll('.quote-container').forEach(container => {
      const data = extractStockData(container);

      output.push(
        `【${data.name}】`,
        `⭕ 当前价: ${data.price} (${data.change} ${data.changeRate})`,
        `⭕ 状态: ${data.status} @ ${data.time}`,
        '⭕ 详细信息:'
      );

      // 智能排版优化
      const keys = Object.keys(data.details);
      const maxKeyLen = Math.max(...keys.map(k => k.length)) || 6;
      for (let i=0; i<keys.length; i+=2) {
        const line = [i, i+1]
          .filter(j => j < keys.length)
          .map(j => {
            const k = keys[j];
            return `▫ ${k.padEnd(maxKeyLen)} : ${data.details[k]}`;
          })
          .join('    ');
        output.push(line);
      }

      output.push(''); // 空行分隔
    });

    GM_setClipboard(output.join('\n'), 'text').then(() => {
      btn.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)';
      setTimeout(() => {
        btn.style.background = 'linear-gradient(135deg, #6B48FF 0%, #00D1FF 100%)';
      }, 800);
    });
  });


// 获取需要的元素
const containerLg = document.querySelector('.container-lg');
const containerSm = document.querySelector('.container-sm');
const editorContainer = document.querySelector('.editor-container');
const stockTimeline = document.querySelector('.stock-timeline');

if (containerLg && containerSm && editorContainer && stockTimeline) {
  // 1. 创建一个新的 div 作为包裹容器
  const wrapperDiv = document.createElement('div');
  wrapperDiv.className = 'editor-wrapper'; // 可以自定义 class

  // 2. 把 editor-container 和 stock-timeline 放进 wrapperDiv
  wrapperDiv.appendChild(editorContainer);
  wrapperDiv.appendChild(stockTimeline);

  // 3. 把 wrapperDiv 插入到 container-lg 下，放在 container-sm 旁边
  containerLg.insertBefore(wrapperDiv, containerSm.nextSibling);
} else {
  console.error('One or more required elements not found');
}

        // 1. 隐藏原版 stock-links
    const originalStockLinks = document.querySelector('.stock-links');
    if (!originalStockLinks) return;
    originalStockLinks.style.display = 'none';

    // 2. 克隆原版内容
    const clonedMenu = originalStockLinks.cloneNode(true);
    clonedMenu.style.display = ''; // 重置 display

    // 3. 创建菜单容器
    const catMenu = document.createElement('div');
    catMenu.className = 'cat-menu';

    // 4. 创建渐变猫爪按钮
    const pawButton = document.createElement('button');
    pawButton.className = 'cat-paw-button';
    pawButton.innerHTML = '🐾 菜单';
    pawButton.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止事件冒泡
        catMenu.classList.toggle('expanded');
    });

    // 5. 包裹菜单内容
    const menuContent = document.createElement('div');
    menuContent.className = 'stock-links-menu';
    menuContent.appendChild(clonedMenu);

    // 6. 组合元素并插入到页面
    catMenu.appendChild(pawButton);
    catMenu.appendChild(menuContent);
    document.body.appendChild(catMenu);

    // 7. 点击页面其他区域关闭菜单
    document.addEventListener('click', () => {
        catMenu.classList.remove('expanded');
    });
    menuContent.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止菜单内部点击触发关闭
    });

    // 8. 添加CSS样式
    GM_addStyle(`
        .cat-menu {
            position: fixed;
            top: 400px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        .cat-paw-button {
            background: linear-gradient(135deg, #6B48FF 0%, #00D1FF 100%);
            color: white;
            padding: 8px 15px;
            border-radius: 25px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            font: 14px/1.5 'Microsoft YaHei';
            border: none;
            transition: 0.3s;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .cat-paw-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .stock-links-menu {
            background: white;
            width: 240px;
            max-height: 0;
            overflow: hidden;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            transition: max-height 0.3s, padding 0.3s;
            margin-top: 10px;
        }
        .cat-menu.expanded .stock-links-menu {
            max-height: 70vh;
            padding: 12px;
            overflow-y: auto;
        }
        .stock-links-menu ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .stock-links-menu li a {
            display: block;
            padding: 8px 12px;
            color: #333;
            text-decoration: none;
            border-radius: 6px;
            font-size: 13px;
            transition: 0.2s;
        }
        .stock-links-menu li a:hover {
            background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
            color: #1976D2;
        }
        /* 滚动条美化 */
        .stock-links-menu::-webkit-scrollbar {
            width: 4px;
        }
        .stock-links-menu::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #6B48FF 0%, #00D1FF 100%);
            border-radius: 2px;
        }
    `);
})();
