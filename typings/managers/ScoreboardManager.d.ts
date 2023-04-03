export = ScoreboardManager;
declare class ScoreboardManager {
    static resolveObjective(objective: string | ScoreboardObjective): string;
    constructor(world: import('../structures/World'));
    get world(): import("../structures/World");
    getObjectives(): Promise<ScoreboardObjective[]>;
    getObjective(objectiveId: string): Promise<ScoreboardObjective | undefined>;
    addObjective(objectiveId: string, displayName?: string): Promise<ScoreboardObjective | null>;
    removeObjective(objectiveId: string | ScoreboardObjective): Promise<boolean>;
    getScores(player: string): Promise<{
        [objective: string]: number;
    }>;
    getScore(player: string, objectiveId: string | ScoreboardObjective): Promise<number | null>;
    setScore(player: string, objectiveId: string | ScoreboardObjective, score: number): Promise<number | null>;
    addScore(player: string, objectiveId: string | ScoreboardObjective, score: number): Promise<number | null>;
    removeScore(player: string, objectiveId: string | ScoreboardObjective, score: number): Promise<number | null>;
    resetScore(player: string, objectiveId?: string | ScoreboardObjective): Promise<boolean>;
    setDisplay(displaySlotId: string, objectiveId: string | ScoreboardObjective | undefined, sortOrder: 'ascending' | 'descending' | undefined): Promise<boolean>;
    #private;
}
import ScoreboardObjective = require("../structures/ScoreboardObjective");
