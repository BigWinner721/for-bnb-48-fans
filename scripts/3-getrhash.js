const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 随机延迟函数，模拟人类操作
function randomDelay(min = 100, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false, // 关闭无头模式，以便看到浏览器操作
            defaultViewport: { width: 3000, height: 2000 } // 设置浏览器窗口尺寸
        });
        const page = await browser.newPage();
        await page.goto('https://dune.com/queries/3271386/5475821', { waitUntil: 'networkidle2' });
        console.log("页面加载完成");

        await page.waitForTimeout(15000); // 等待页面加载

        const totalRowsSelector = '.table_total__a7QuL';
        await page.waitForSelector(totalRowsSelector, { timeout: 60000 });
        const totalRows = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) {
                // 去除数字中的逗号
                const text = element.innerText.split(' ')[0].replace(/,/g, '');
                return parseInt(text);
            }
            return 0;
        }, totalRowsSelector);
        console.log(`总行数: ${totalRows}`);

        const rowsPerPage = 25;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        let allData = [];

        for (let i = 1; i <= totalPages; i++) {
            const rowSelector = 'tbody[role="rowgroup"] tr[role="row"]';
            await page.waitForSelector(rowSelector, { timeout: 60000 });
            let data = await page.evaluate((sel) => {
                let tableRows = document.querySelectorAll(sel);
                return Array.from(tableRows).map(row => {
                    const cell = row.querySelector('td[role="cell"] div div');
                    return cell ? cell.innerText.trim() : '';
                });
            }, rowSelector);

            allData.push(...data.filter(hash => hash));

            if (i < totalPages) {
                await page.click('button[type="button"] svg[icon="chevron-right"]');
                await page.waitForTimeout(randomDelay()); // 添加随机延迟
            }
        }

        fs.writeFileSync(path.join(__dirname, 'received_hashs.csv'), allData.join('\n'));
        console.log("数据已保存到 CSV 文件");

        await browser.close();
    } catch (error) {
        console.error("脚本运行过程中发生错误:", error);
    }
})();

