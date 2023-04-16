export const Util: typeof import("./util/Util");
export const Logger: typeof import("./util/Logger");
export const World: typeof import("./structures/World");
export const Server: typeof import("./Server");
export const Events: {
    ServerOpen: string;
    ServerClose: string;
    WorldAdd: string;
    WorldRemove: string;
    PlayerJoin: string;
    PlayerLeave: string;
    PacketReceive: string;
    Error: string;
    PlayerChat: string;
    PlayerTitle: string;
    Tick: string;
};
export const ScoreboardManager: typeof import("./managers/ScoreboardManager");
export const ScoreboardObjective: typeof import("./structures/ScoreboardObjective");