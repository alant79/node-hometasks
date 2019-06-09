const path = require('path');
const fs = require('fs');
const walk = (base, callbackOnFolder, callbackOnFile) => {
  return new Promise(resolve => {
    fs.readdirSync(base).forEach(async item => {
      let localBase = path.join(base, item);
      if (!fs.statSync(localBase).isDirectory()) {
        await callbackOnFile(item, localBase, resolve);
      } else {
        walk(localBase, callbackOnFolder, callbackOnFile).then(async () => {
          callbackOnFolder && await callbackOnFolder(localBase, resolve);
        });
      }
    });
  });
};

module.exports = walk;
