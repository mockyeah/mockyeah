const WebSocket = require('ws');
const proxyRecord = require('../app/lib/proxyRecord');

const withAdminServer = ({ app, instance }) => {
  if (!app.config.noWebSocket) {
    const wss = new WebSocket.Server({ server: instance.adminServer });

    wss.on('connection', ws => {
      ws.on('message', message => {
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

      const onRecord = () => {
        ws.send(JSON.stringify({ type: 'record' }));
      };

      const onRecordStop = () => {
        ws.send(JSON.stringify({ type: 'recordStop' }));
      };

      app.on('record', onRecord);
      app.on('recordStop', onRecordStop);

      ws.on('close', () => {
        app.off('record', onRecord);
        app.off('recordStop', onRecordStop);
      });

      ws.send(JSON.stringify({ type: 'connected' }));
    });
  }
};

module.exports = withAdminServer;
