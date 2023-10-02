export = Server;
declare class Server extends WebSocket.Server {
    constructor(option?: import("./types").ServerOption);
    option: import("./types").ServerOption;
    startTime: number;
    logger: Logger;
    ip: string;
    events: Events;
    getWorld(worldId: string): World | undefined;
    getWorlds(): World[];
    runCommand(command: string): Promise<any[]>;
    sendMessage(message: string | any, target?: string): Promise<void[]>;
    disconnectAll(): void;
    #private;
}
import WebSocket = require("ws");
import Logger = require("./util/Logger");
import World = require("./structures/World");
import Events = require("./structures/Events");