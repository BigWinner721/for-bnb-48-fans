//此脚本笨拙，用于检查文件 check.csv中的hash是否符合mint要求，符合的会输出到 checked.csv  hash值只需要从bscscan下载即可

//另有dune方法 ，更为高效，但不充钱就有一些小问题。分享一些小工具如下
    //查一个地址 有效mint的hash   https://dune.com/queries/3269353/5472487
    //查一个mint出来的铭文是否被双花&假发送 https://dune.com/queries/3269503/5472738

const ethers = require('ethers');
const fs = require('fs');
const Papa = require('papaparse');

const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.bnbchain.org");

async function fansTxFilter(txHash) {
    try {
        // 获取交易详情
        const tx = await provider.getTransaction(txHash);

        // 检查交易是否存在
        if (!tx) {
            console.log(`交易 ${txHash} 不存在`);
            return false;
        }

        // 获取区块详情
        const block = await provider.getBlock(tx.blockNumber);

        // 这里是您之前提供的过滤逻辑
        const number = parseInt(block.number);
        if (number <= 34175786 || number > 34183076) {
            return false;
        }

        if (block.miner.toLowerCase() != '0x72b61c6014342d914470ec7ac2975be345796c2b') {
            return false;
        }

        if (tx.from.toLowerCase() === tx.to.toLowerCase() &&
            tx.input === '0x646174613a2c7b2270223a22626e622d3438222c226f70223a226d696e74222c227469636b223a2266616e73222c22616d74223a2231227d') {
            return true;
        }

        return false;
    } catch (error) {
        console.error(`处理交易 ${txHash} 时出错:`, error);
        return false;
    }
}
async function filterTxInCsv(csvFilePath, outputFilePath) {
    try {
        const csvFile = fs.readFileSync(csvFilePath, 'utf8');
        const parsedCsv = Papa.parse(csvFile, { header: true });

        const outputStream = fs.createWriteStream(outputFilePath);

        // 写入 CSV 头部
        outputStream.write(Object.keys(parsedCsv.data[0]).join(',') + '\n');

        for (const row of parsedCsv.data) {
            const tx = row.Tx; // 假设 CSV 文件中的列名为 'Tx'
            const isValid = await fansTxFilter(tx);
            console.log(`交易哈希 ${tx} 检查结果: ${isValid ? '有效' : '无效'}`);

            if (isValid) {
                const line = Papa.unparse([row], { header: false });
                outputStream.write(line + '\n');
            }
        }

        outputStream.end();
        console.log('CSV 文件已更新');
    } catch (error) {
        console.error('处理 CSV 文件时出错:', error);
    }
}

// CSV 文件路径
const csvFilePath = 'res/1-check.csv';
const outputFilePath = 'res/1-checked.csv';

filterTxInCsv(csvFilePath, outputFilePath);