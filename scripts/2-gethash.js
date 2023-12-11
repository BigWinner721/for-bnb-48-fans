const puppeteer = require('puppeteer');
const fs = require('fs');

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new" // 使用新的无头模式
    });
    const page = await browser.newPage();
    await page.goto('https://evm.ink/address/0x39cAa8179A80465DCa62CbF10A87E31D6f5ca4Dc?currentTab=inscriptions', {waitUntil: 'networkidle2'});

    await autoScroll(page);

    const hashes = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="/marketplace/eip155:56/"]'));
        return links.map(link => {
            const href = link.getAttribute('href');
            const match = href.match(/\/marketplace\/eip155:56\/(.*?):/);
            return match ? match[1] : null;
        }).filter(hash => hash !== null);
    });

    console.log(hashes);

    fs.writeFileSync('hashs.csv', hashes.join('\n'));

    await browser.close();
})();
