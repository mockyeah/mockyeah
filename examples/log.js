module.exports = (res) => {
  console.log('res status: ' + res.statusCode);
  console.log('res headers: ' + JSON.stringify(res.headers, null, 2));
  res.on('data', (chunk) => console.log(chunk.toString()));
};
