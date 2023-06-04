export = World;
declare class World {
    constructor(server: import('../Server'), ws: WebSocket.WebSocket, name: string);
    server: import('../Server');
    name: string;
    logger: Logger;
    lastPlayers: string[];
    maxPlayers: number;
    scoreboards: ScoreboardManager;
    connectedAt: number;
    id: string;
    localPlayer: string | null;
    get ping(): number;
    get ws(): WebSocket.WebSocket;
    runCommand(command: string): Promise<any>;
    sendMessage(message: string | any, target?: string): Promise<void>;
    getPlayerList(): Promise<import("../types").PlayerList>;
    getPlayers(): Promise<string[]>;
    getLocalPlayer(): Promise<string>;
    getTags(player: string): Promise<string[]>;
    hasTag(player: string, tag: string): Promise<boolean>;
    getPlayerDetail(): Promise<import("../types").PlayerDetail>;
    sendPacket(packet: import("../types").ServerPacket): void;
    _handlePacket(packet: import("../types").ServerPacket): void;
    _startInterval(): void;
    _stopInterval(): void;
    subscribeEvent(eventName: string): void;
    unsubscribeEvent(eventName: string): void;
    
    /**
     * Use disconnect() instead.
     * @deprecated
     */
    close(): void;
    disconnect(): void;
    
    #private;
}
import WebSocket = require("ws");
import Logger = require("../util/Logger");
import ScoreboardManager = require("../managers/ScoreboardManager");
