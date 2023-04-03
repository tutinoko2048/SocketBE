export = Server;
declare class Server extends WebSocket.Server<WebSocket.WebSocket> {
    constructor(option?: {});
    option: ServerOption;
    startTime: number;
    logger: Logger;
    ip: string;
    events: any;
    getWorld(worldId: string): World | undefined;
    getWorlds(): World[];
    runCommand(command: string): Promise<any[]>;
    sendMessage(message: string | any, target?: string): Promise<void[]>;
    #private;
}
import WebSocket = require("ws");
import Logger = require("./util/Logger");
import World = require("./structures/World");
