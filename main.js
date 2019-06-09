const yargs = require('yargs');
const http = require('http');
const port = 3000;
const argv = yargs
  .usage('Usage: $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('$0 --interval 2000 --duration 6000', '--> через interval (мсек) происходит вывод в консоль времени, прекращение вывода через duration (мсек)')
  .option('interval', {
    alias: 'i',
    describe: 'Интревал в мсек, через который будет происходить вывод в консоль времени',
    demandOption: true
  })
  .option('duration', {
    alias: 'd',
    describe: 'Длительность в мсек, через которую выводит в консоль прекратится',
    demandOption: true
  })
  .epilog('Node.js 1st week meeting')
  .argv;

const timerId = setInterval(() => {
  console.log(Date());
}, parseInt(argv.interval));

const server = http.createServer((req, res) => {
  setTimeout(() => {
    clearInterval(timerId);
    res.end(Date());
  }, parseInt(argv.duration));
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
