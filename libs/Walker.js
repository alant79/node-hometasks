const path = require('path');
const fs = require('fs');
const walk = (base, callbackOnFolder, callbackOnFile, done) => {
  fs.readdirSync(base).forEach(item => {
    let localBase = path.join(base, item);
    if (!fs.statSync(localBase).isDirectory()) {
      callbackOnFile(item, localBase, done);
    } else {
      walk(localBase, callbackOnFolder, callbackOnFile, done);
      if (callbackOnFolder) {
        callbackOnFolder(localBase, done);
      }
    }
  });
};

module.exports = walk;
