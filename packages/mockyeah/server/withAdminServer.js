const WebSocket = require('ws');
const proxyRecord = require('../app/lib/proxyRecord');

const withAdminServer = ({ app, instance }) => {
  const wss = new WebSocket.Server({ server: instance.adminServer });

  wss.on('connection', function connection(ws) {
    console.log('connection')
    ws.on('message', function incoming(message) {
      const action = JSON.parse(message);

      if (action.type === 'recordPush') {
        const { req, reqUrl, startTime, body, headers, status } = action.payload;

        proxyRecord({
          app,
          req,
          reqUrl,
          startTime,
          body,
          headers,
          status
        });
      }
    });

    const onRecord = payload => {
      ws.send(JSON.stringify({ type: 'record', payload }));
    };

    app.on('record', onRecord);

    const onRecordStop = () => {
      ws.send(JSON.stringify({ type: 'recordStop' }));
    };

    app.on('recordStop', onRecordStop);

    ws.on('close', () => {
      app.off('record', onRecord)
      app.off('recordStop', onRecordStop);
    });

    ws.send(JSON.stringify({ type: 'connected' }));
  });
};

module.exports = withAdminServer;
