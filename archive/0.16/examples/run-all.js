const fs = require('fs');
const path = require('path');

const execAndWait = filePaths => {
  const mockyeah = require('./mockyeah');
  const next = filePaths.pop();
  if (!next) process.exit();
  mockyeah.close = () => setTimeout(execAndWait.bind(null, filePaths), 2000);
  console.log('\nRUNNING ' + next + '\n');
  require(next);
};

fs.readdir(__dirname, (err, files) => {
  const filePaths = [];
  files.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    if (/respond[\-\w]+\.js$/.test(filePath)) filePaths.push(filePath);
  });

  execAndWait(filePaths);
});
