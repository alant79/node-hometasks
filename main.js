const URL = 'https://www.work.ua';
const URLSEARCH = '/ru/jobs-node+js/';
const scrape = require('./libs/scrape');
const { groupByCity, exportToExcel } = require('./libs/transform');
const fs = require('fs');
const yargs = require('yargs');
const argv = yargs
  .usage('Usage: $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('$0 --format json --group', '--> выгрузка данных в JSON с группировкой по городу')
  .example('$1 --format exel', '--> выгрузка данных в EXCEL')
  .option('format', {
    alias: 'f',
    describe: 'Формат выгрузки JSON или EXCEL',
    demandOption: true
  })
  .option('group', {
    alias: 'g',
    describe: 'Необходимо сгруппировать данные по городу',
    type: Boolean
  })
  .epilog('Node.js web scraping')
  .argv;
if (argv.format !== 'json' && argv.format !== 'excel') {
  console.log('Необходимо выбрать формат json или excel');
  process.exit(1);
} else {
  scrape(URL, URLSEARCH).then((res) => {
    if (argv.format === 'json') {
      if (argv.group) {
        fs.writeFileSync('scrape.json', JSON.stringify(groupByCity(res), '', 2));
      } else {
        fs.writeFileSync('scrape.json', JSON.stringify(res, '', 2));
      }
    } else {
      exportToExcel(res);
    }
  });
}
