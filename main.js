const fs = require('fs');
const path = require('path');
const filenames = process.argv.slice(2);

if (filenames.length < 2) {
  console.error('Должно быть задано не менее 2-х параметров');
  process.exit(1);
}

const src = filenames[0];
const dist = filenames[1];
const del =
  filenames.length === 2 ? true : filenames[2].toLowerCase().trim() === 'true';

if (!fs.existsSync(dist)) {
  fs.mkdir(dist, err => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
  });
}

const readDir = base => {
  fs.readdirSync(base).forEach(item => {
    let localBase = path.join(base, item);
    if (!fs.statSync(localBase).isDirectory()) {
      // создаем папку по первой букве файла
      let firstWord = item.charAt(0).toUpperCase();
      let dir = path.join(dist, firstWord);
      if (!fs.existsSync(dir)) {
        fs.mkdir(dir, err => {
          if (err) {
            console.error(err.message);
            process.exit(1);
          }
        });
      }
      // копируем файл в папку-приемник
      let newFile = path.join(dir, item);
      fs.link(localBase, newFile, err => {
        if (err) {
          console.error(err.message);
          process.exit(1);
        }
      });
      // удаляем файл источник
      if (del) {
        fs.unlink(localBase, err => {
          if (err) {
            console.error(err.message);
            process.exit(1);
          }
        });
      }
    } else {
      readDir(localBase);
      // удаляем папку источник
      if (del) {
        fs.rmdir(localBase, err => {
          if (err) {
            console.error(err.message);
            process.exit(1);
          }
        });
      }
    }
  });
};

readDir(src);
if (del) {
  fs.rmdir(src, err => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
  });
}
