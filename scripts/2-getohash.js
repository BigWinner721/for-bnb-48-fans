const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function autoScroll(page, expectedRows) {
    let currentRows = 0;
    while (currentRows < expectedRows) {
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForTimeout(5000); // 增加等待时间
        currentRows = await page.evaluate(() => document.querySelectorAll('a[href^="/marketplace/eip155:56/"]').length / 3);
        console.log(`当前行数: ${currentRows}, 预期行数: ${expectedRows}`);
    }
}

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 600000
        });
        const page = await browser.newPage();
        await page.goto('https://evm.ink/address/0x198286504B9e946081f098563ed53Bd461B75B8C?currentTab=inscriptions', { waitUntil: 'networkidle2' });

        console.log('页面已加载，等待选择器');
        await page.waitForSelector('a[href^="/marketplace/eip155:56/"]', { timeout: 600000 });
        console.log('选择器可用，开始滚动');

        const expectedRows = await page.evaluate(() => {
            const header = document.querySelector('h1.text-4xl.font-bold');
            return header ? Math.ceil(parseInt(header.textContent.match(/\((\d+)\)/)[1]) / 3) : 0;
        });
        console.log(`预期行数: ${expectedRows}`);

        await autoScroll(page, expectedRows);
        console.log('滚动完成，开始收集数据');

        const stream = fs.createWriteStream(path.join(__dirname, 'output/owned_hashs.csv'), { flags: 'a' });

        const hashes = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href^="/marketplace/eip155:56/"]'));
            return links.map(link => {
                const href = link.getAttribute('href');
                const match = href.match(/\/marketplace\/eip155:56\/(.*?):/);
                return match ? match[1] : null;
            }).filter(hash => hash !== null);
        });

        console.log('数据收集完成，开始写入文件');
        hashes.forEach(hash => {
            stream.write(hash + '\n');
        });

        stream.end();
        console.log('数据已保存到 CSV 文件');

        await browser.close();
    } catch (error) {
        console.error('脚本运行过程中发生错误:', error);
    }
})();
