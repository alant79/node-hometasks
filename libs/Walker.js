const path = require('path');
const fs = require('fs');
const walk = (base, del, callbackOnFile, done) => {
  fs.readdirSync(base).forEach(item => {
    let localBase = path.join(base, item);
    if (!fs.statSync(localBase).isDirectory()) {
      callbackOnFile(item, localBase, done);
    } else {
      walk(localBase, del, callbackOnFile, done);
      // удаляем папку источник
      if (del) {
        try {
          fs.rmdirSync(localBase);
        } catch (err) {
          return err.message;
        }
      }
    }
  });
};

module.exports = walk;
