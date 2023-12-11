const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // 使用非无头模式以便观察浏览器行为
        defaultViewport: { width: 1920, height: 1080 },
        timeout: 600000 // 增加启动超时时间
    });
    const page = await browser.newPage();
    await page.goto('https://evm.ink/address/0x349503CcA8867C8e5c75e9D8C17b7DBe0eF13D76?currentTab=inscriptions', { waitUntil: 'networkidle2' });

    await page.waitForSelector('a[href^="/marketplace/eip155:56/"]', { timeout: 600000 });
    await autoScroll(page);
    await page.waitForTimeout(10000);

    const stream = fs.createWriteStream(path.join(__dirname, 'output/owned_hashs.csv'), { flags: 'a' });

    const hashes = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="/marketplace/eip155:56/"]'));
        return links.map(link => {
            const href = link.getAttribute('href');
            const match = href.match(/\/marketplace\/eip155:56\/(.*?):/);
            return match ? match[1] : null;
        }).filter(hash => hash !== null);
    });

    // 逐行写入文件
    hashes.forEach(hash => {
        stream.write(hash + '\n');
    });

    stream.end();
    console.log('数据已保存到 CSV 文件');

    await browser.close();
})();
