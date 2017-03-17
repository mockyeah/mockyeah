module.exports = (res) => {
  console.log('res status: ' + res.statusCode);
  console.log('res type: ' + res.headers['content-type']);
  res.on('data', (chunk) => console.log(chunk.toString()));
};
