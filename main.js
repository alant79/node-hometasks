const fs = require('fs');
const filenames = process.argv.slice(2);
const walker = require('./libs/walker');
const path = require('path');

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

const copyFiles = (item, localBase, done) => {
  // создаем папку-приемник по первой букве файла
  let firstWord = item.charAt(0).toUpperCase();
  let dir = path.join(dist, firstWord);
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {
      if (err) {
        done(err.message);
      }
    });
  }
  // копируем файл в папку-приемник
  let newFile = path.join(dir, item);
  try {
    fs.linkSync(localBase, newFile);
  } catch (err) {
    done(err.message);
  }
  done();
};

const moveFiles = (item, localBase, done) => {
  copyFiles(item, localBase, done);
  // удаляем файл источник
  if (del) {
    try {
      fs.unlinkSync(localBase);
    } catch (err) {
      done(err.message);
    }
  }
  done();
};

walker(src, del, del ? moveFiles : copyFiles, err => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
});

if (del) {
  fs.rmdir(src, err => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
  });
}
