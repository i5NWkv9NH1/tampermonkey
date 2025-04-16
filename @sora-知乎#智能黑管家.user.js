// ==UserScript==
// @name         @sora/知乎#智能黑管家
// @namespace    https://i5nwkv9nk1.github.io/
// @version      2.5
// @description  动态过滤+黑名单管理+DOM优化
// @icon         https://www.google.com/s2/favicons?domain=zhihu.com
// @match        https://www.zhihu.com/question/*
// @match        https://www.zhihu.com/question/*/answer/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
/* 增强屏蔽按钮样式 */
.neko-block-btn {
  background: none!important;
  color: #8590a6!important;
  padding: 0 8px!important;
  margin-left: 10px!important;
  border-left: 1px solid #ebebeb!important;
  cursor: pointer!important;
}
.neko-block-btn:hover {
  color: #f5222d!important;
}
.neko-block-btn::before {
  content: "🚫";
  margin-right: 3px;
}

/* 被屏蔽提示增强 */
.neko-blocked-tip {
  padding: 15px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  margin: 10px 0;
  color: #666;
  font-size: 0.9em;
}
`);

(function() {
    'use strict';

    const debounce = (func, wait=300) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        }
    }

    class Blocker {
        constructor() {
            this.BLOCK_KEY = 'NEKO_ZHIHU_BLOCK_LIST';
            this.blockList = GM_getValue(this.BLOCK_KEY, []);
            this.observer = null;
            this.init();
        }



                // 初始化监听
        init() {
            this.optimizeDOM();
            this.addBlockButtons();
            this.startObserve();
        }

                // 存储更新
        saveBlockList() {
            GM_setValue(this.BLOCK_KEY, [...new Set(this.blockList)]);
        }

                // DOM清理优化
        optimizeDOM() {
            document.querySelectorAll('[data-za-extra-module], [data-za-detail-view-path-module]').forEach(el => {
                el.removeAttribute('data-za-extra-module');
                el.removeAttribute('data-za-detail-view-path-module');
            });
        }


        // 新增：统一处理所有关联内容
        processUserContent(userUrl) {
            // 处理主回答
            document.querySelectorAll(`.AnswerItem meta[itemprop="url"][content="${userUrl}"]`).forEach(meta => {
                this.replaceContent(meta.closest('.AnswerItem'));
            });

            // 处理评论区回复（新增部分）
            document.querySelectorAll(`.CommentItem meta[itemprop="url"][content="${userUrl}"]`).forEach(meta => {
                this.replaceContent(meta.closest('.CommentItem'));
            });
        }

replaceContent(element) {
    if (element.classList.contains('neko-blocked')) return;
    const isAd = this.isAd(element);
    const tip = document.createElement('div');
    tip.className = isAd ? 'neko-ad-tip' : 'neko-blocked-tip';
    tip.innerHTML = isAd ? '已为您屏蔽知乎广告' : '根据您的设置已隐藏此内容';

    element.parentNode.replaceChild(tip, element);
    element.classList.add('neko-blocked');
  }

        // 修改：按钮持久化逻辑
        addBlockButtons() {
            document.querySelectorAll('.AuthorInfo:not(.neko-processed)').forEach(author => {
                author.classList.add('neko-processed');

                const btn = document.createElement('button');
                btn.className = 'neko-block-btn';
                btn.textContent = '屏蔽';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const answer = author.closest('.AnswerItem, .CommentItem');
                    const userUrl = answer.querySelector('meta[itemprop="url"]').content;

                    if (!this.blockList.includes(userUrl)) {
                        this.blockList.push(userUrl);
                        GM_setValue(this.BLOCK_KEY, this.blockList);
                    }

                    this.processUserContent(userUrl); // 新增即时处理
                    this.showToast(`已屏蔽用户，累计屏蔽 ${this.blockList.length} 人`);
                };
                author.appendChild(btn);
            });
        }

        // 优化监听逻辑
        startObserve() {
            this.observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        this.addBlockButtons(); // 修复按钮消失的关键
                        this.blockList.forEach(url => this.processUserContent(url));
                                mutation.addedNodes.forEach(node => {
          // 增强广告节点检测
          if (this.isAd(node)) {
            this.replaceContent(node);
          }
        });
                    }
                });
            });

            this.observer.observe(document, {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false
            });
        }

        // 其他方法保持不变...
                // 提示反馈
        showToast(text) {
            const toast = document.createElement('div');
            toast.style = 'position:fixed; top:20px; right:20px; background:#52c41a; color:white; padding:8px 15px; border-radius:4px; z-index:99999;';
            toast.textContent = text;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }

                // 判断是否需要屏蔽
        shouldBlock(answer) {
            const authorUrl = answer.querySelector('meta[itemprop="url"]')?.content;
            if (this.blockList.includes(authorUrl)) return true;
            const hasDeclaration = answer.querySelector('.css-9x8rdd .css-1e6ipk4');
            return !!hasDeclaration;
            if (this.isAd(element)) return true;
        }

      isAd(element) {
    return element.querySelector('.Pc-word');
  }
        // 处理单个回答
        processAnswer(answer) {
            if (!this.shouldBlock(answer)) return;

            const tip = document.createElement('div');
            tip.className = 'neko-blocked-tip';
            tip.innerHTML = '根据您的设置已隐藏此内容';
            answer.parentNode.replaceChild(tip, answer);
        }
        // 批量处理
        processAnswers = debounce(() => {
            document.querySelectorAll('.AnswerItem').forEach(answer => {
                if (answer.classList.contains('neko-processed')) return;
                this.processAnswer(answer);
                answer.classList.add('neko-processed');
            });
            this.addBlockButtons();
        });
    }

    // 启动脚本
    new Blocker();
})();

