// ==UserScript==
// @name         @sora/金十数据#网页版优化
// @namespace    https://i5nwkv9nh1.github.io/
// @icon         https://www.google.com/s2/favicons?domain=www.jin10.com
// @version      1.5
// @description  彻底移除所有广告，优化网页。
// @match        https://www.jin10.com/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_notification
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 0. 预先CSS注入
    GM_addStyle(`
        .top-poster { display: none }
        /* 基础样式优化 */
        .home-main_left {
            width: 100% !important;
            max-width: 900px !important;
            margin: 0 auto !important;
            padding: 20px !important;
            height: auto !important;
            min-height: 100vh !important;
            overflow: visible !important;
        }

        .jin-flash_list {
            contain: content !important;
            overflow: visible !important;
            max-height: none !important;
        }

        /* 隐藏导航栏非首页项目 */
        .left-navs .navs-item:not(:first-child) {
            display: none !important;
        }

        /* 扫码内容隐藏 */
        .miniprogram-remark,
        .flash-remark,
        .remark-item {
            display: none !important;
        }

        .tradinghero, .quoted-price_img, .jin-header_toplink, .top-poster, .video, .qr, .menu, .flash-top_tab, .classify  { display: none !important; }
    `);

    // 1. 增强版广告检测
    const isAdvertisement = (node) => {
        // 检测VIP标签和类名
        if (node.querySelector('.jin-tag.is-vip, .vip-nav, .recommend-article, .is-vip')) {
            console.log('[AdDetector] VIP content detected');
            return true;
        }

        // 检测扫码查看内容
        if (node.querySelector('.miniprogram-remark, .flash-remark, [title*="扫码"]')) {
            console.log('[AdDetector] Scan code content detected');
            return true;
        }

        // 检测super_vip链接
        const vipLinks = node.querySelectorAll('a[href*="super_vip"], a[href*="vip"]');
        if (vipLinks.length > 0) {
            console.log('[AdDetector] VIP link detected:', vipLinks[0].href);
            return true;
        }

        // 检测图片广告（无实质文字内容）
        const imgs = node.querySelectorAll('img');
        if (imgs.length > 0) {
            const hasText = node.textContent.replace(/\s+/g, '').length > 30;
            const isAdImage = Array.from(imgs).some(img =>
                img.src.match(/misc|advert|promo|recruit|共学圈|banner|ads?|mp/i) ||
                img.alt.includes('扫码') ||
                img.parentElement.tagName === 'A'
            );

            if (!hasText || isAdImage) {
                console.log('[AdDetector] Image ad detected:', imgs[0]?.src);
                return true;
            }
        }

        // 检测文字广告
        const adKeywords = [
            '胖达共学圈', 'VIP', '会员专享', '立即加入',
            '限时优惠', '扫码加入', '立即订阅', '点击获取',
            '智囊团', '私人服务', '>>>', '&gt;&gt;&gt;'
        ];
        if (adKeywords.some(keyword => node.textContent.includes(keyword))) {
            console.log('[AdDetector] Text ad detected');
            return true;
        }

        return false;
    };

    // 2. 高性能元素移除器
    const removeElements = () => {
        const selectors = [
            '.home-main_right', '.tradinghero', '.custom-layout',
            '.feedback', '.top-poster', '.top-ad', '.app-down',
            '.tradinghero', '.qr', '.video', '.water-mark', '.jin-footer', '.quoted-price_img',
            '.left-navs .navs-item:not(:first-child)',
            '.miniprogram-remark', '.flash-remark' // 新增扫码内容
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                console.log('[AdRemover] Removing element:', selector);
                el.remove();
            });
        });
    };

    // 3. 动态内容处理器（超轻量级）
    const handleDynamicContent = () => {
        const observer = new MutationObserver(mutations => {
            requestIdleCallback(() => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && isAdvertisement(node)) {
                            console.log('[ContentFilter] Removing ad node:', node);
                            node.remove();
                        }
                    });
                });
            }, { timeout: 100 });
        });

        observer.observe(document.getElementById('jin_flash_list'), {
            childList: true,
            subtree: true
        });

        // 初始清理
        document.querySelectorAll('.jin-flash-item-container').forEach(item => {
            if (isAdvertisement(item)) {
                console.log('[ContentFilter] Initial cleanup removing:', item);
                item.remove();
            }
        });
    };

    // 4. 一键复制功能（增强版）
    const setupCopyButton = () => {
        const btn = document.createElement('button');
        btn.id = 'jin10-copy-btn';
        btn.textContent = '🐾 一键复制';
        btn.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            padding: 10px 20px !important;
            background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
            color: white !important;
            border: none !important;
            border-radius: 50px !important;
            cursor: pointer !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
            font-size: 16px !important;
            z-index: 9999 !important;
            transition: all 0.3s ease !important;
        `;

        btn.addEventListener('click', async () => {
            const items = Array.from(document.querySelectorAll('.jin-flash-item-container'))
                .filter(item => !isAdvertisement(item));

            let output = '';
            items.forEach(item => {
                const id = item.id.replace('flash', '');
                const timeMatch = id.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);

                if (timeMatch) {
                    const formattedTime = `${timeMatch[1]}-${timeMatch[2]}-${timeMatch[3]} ${timeMatch[4]}:${timeMatch[5]}:${timeMatch[6]}`;
                    const text = item.querySelector('.flash-text')?.textContent
                        .replace(/>>>|&gt;&gt;&gt;/g, '')
                        .trim() || '';

                    if (text) {
                        output += `${formattedTime} ${text}\n\n`;
                    }
                }
            });

            if (output) {
                try {
                    await navigator.clipboard.writeText(output.trim());
                    btn.textContent = '✓ 复制成功!';
                    setTimeout(() => btn.textContent = '🐾 一键复制', 2000);
                } catch (err) {
                    console.error('Copy failed:', err);
                    GM_notification('复制失败，请手动选择文本复制', '错误');
                }
            }
        });

        document.body.appendChild(btn);
    };

    // 5. 启动优化
    const init = () => {
        removeElements();
        handleDynamicContent();
        setupCopyButton();

        // 定期检查漏网之鱼（性能优化版）
        const periodicCheck = () => {
            requestIdleCallback(() => {
                document.querySelectorAll('.jin-flash-item-container').forEach(item => {
                    if (isAdvertisement(item)) {
                        console.log('[PeriodicCheck] Removing missed ad:', item);
                        item.remove();
                    }
                });
                setTimeout(periodicCheck, 5000);
            }, { timeout: 200 });
        };
        periodicCheck();
    };

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();