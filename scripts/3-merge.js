const fs = require('fs');
const readline = require('readline');

async function readCSV(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const lines = new Set();

    for await (const line of rl) {
        lines.add(line.trim());
    }

    return lines;
}

async function findDuplicates() {
    const hashs = await readCSV('hashs.csv');
    const ahashs = await readCSV('ahashs.csv');

    const duplicates = [...hashs].filter(hash => ahashs.has(hash));

    fs.writeFileSync('nhahs.csv', duplicates.join('\n'));
    console.log('Duplicates saved to nhahs.csv');
}

findDuplicates().catch(console.error);
