export = ScoreboardObjective;
declare class ScoreboardObjective {
    constructor(world: import('./World'), objectiveId: string, displayName?: string);
    readonly get world(): import("./World");
    readonly get id(): string;
    readonly get displayName(): string;
    getScore(player: string): Promise<number | null>;
    setScore(player: string, score: number): Promise<number | null>;
    addScore(player: string, score: number): Promise<number | null>;
    removeScore(player: string, score: number): Promise<number | null>;
    resetScore(player: string): Promise<boolean>;
    toJSON(): {
        id: string;
        displayName: string;
    };
    #private;
}
