const { promisify } = require('util');
const fs = require('fs');
const filenames = process.argv.slice(2);
const walker = require('./libs/walker');
const path = require('path');
const mkdirSync = promisify(fs.mkdirSync);
const existsSync = promisify(fs.existsSync);
const linkSync = promisify(fs.linkSync);
const unlinkSync = promisify(fs.unlinkSync);
const rmdirSync = promisify(fs.rmdirSync);

if (filenames.length < 2) {
  console.error('Должно быть задано не менее 2-х параметров');
  process.exit(1);
}

const src = filenames[0];
const dist = filenames[1];
const del =
  filenames.length === 2 ? true : filenames[2].toLowerCase().trim() === 'true';

try {
  !(fs.existsSync(dist)) && fs.mkdirSync(dist);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const copyFiles = (item, localBase, done) => {
  try {
    // создаем папку-приемник по первой букве файла
    let firstWord = item.charAt(0).toUpperCase();
    let dir = path.join(dist, firstWord);
    if (!(fs.existsSync(dir))) {
      fs.mkdirSync(dir);
    }
    console.log('Создали папку ', dir);
    // копируем файл в папку-приемник
    let newFile = path.join(dir, item);
    fs.linkSync(localBase, newFile);
    console.log('Скопировали файл ', newFile);
    done();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const moveFiles = (item, localBase, done) => {
  try {
    copyFiles(item, localBase, done);
    // удаляем файл источник
    console.log('Пытаемся удалить файл ', localBase);
    del && fs.unlinkSync(localBase);
    console.log('Удалили файл ', localBase);
    done();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const delFolder = (localBase, done) => {
  try {
    // удаляем папку источник
    fs.rmdirSync(localBase);
    console.log('Удалили папку ', localBase);
    done();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

walker(src, del ? delFolder : null, del ? moveFiles : copyFiles)
  .then(() => {
    del && fs.rmdirSync(src);
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  })
  .finally(() => console.log('Done'));
