import * as http from 'http';
import { Server } from '../src';

const port = 3000;

const httpServer = http.createServer();
httpServer.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
});

new Server({
  webSocketOptions: {
    server: httpServer
  }
});
