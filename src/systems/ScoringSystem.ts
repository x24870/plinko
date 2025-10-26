import { Ball } from "../entities/Ball";

export interface GameScore {
  totalScore: number;
  ballsDropped: number;
  ballsLanded: number;
  currentMultiplier: number;
  history: ScoreEvent[];
}

export interface ScoreEvent {
  ballId: string;
  score: number;
  binIndex: number;
  timestamp: number;
}

export interface ScoringSystem {
  gameScore: GameScore;
  onScoreUpdate?: (score: GameScore) => void;
  onBallLanded?: (event: ScoreEvent) => void;
}

export function createScoringSystem(
  onScoreUpdate?: (score: GameScore) => void,
  onBallLanded?: (event: ScoreEvent) => void
): ScoringSystem {
  const gameScore: GameScore = {
    totalScore: 0,
    ballsDropped: 0,
    ballsLanded: 0,
    currentMultiplier: 1,
    history: [],
  };

  return {
    gameScore,
    onScoreUpdate,
    onBallLanded,
  };
}

export function recordBallDropped(scoringSystem: ScoringSystem): void {
  scoringSystem.gameScore.ballsDropped++;

  if (scoringSystem.onScoreUpdate) {
    scoringSystem.onScoreUpdate(scoringSystem.gameScore);
  }
}

export function recordBallLanded(
  scoringSystem: ScoringSystem,
  ball: Ball,
  score: number,
  binIndex: number
): void {
  const event: ScoreEvent = {
    ballId: ball.id,
    score: score * scoringSystem.gameScore.currentMultiplier,
    binIndex,
    timestamp: Date.now(),
  };

  // Update game score
  scoringSystem.gameScore.totalScore += event.score;
  scoringSystem.gameScore.ballsLanded++;
  scoringSystem.gameScore.history.push(event);

  // Keep history limited to last 100 events
  if (scoringSystem.gameScore.history.length > 100) {
    scoringSystem.gameScore.history.shift();
  }

  console.log(
    `Ball ${ball.id} landed in bin ${binIndex} - Score: ${event.score} (Total: ${scoringSystem.gameScore.totalScore})`
  );

  // Trigger callbacks
  if (scoringSystem.onBallLanded) {
    scoringSystem.onBallLanded(event);
  }

  if (scoringSystem.onScoreUpdate) {
    scoringSystem.onScoreUpdate(scoringSystem.gameScore);
  }
}

export function setMultiplier(
  scoringSystem: ScoringSystem,
  multiplier: number
): void {
  scoringSystem.gameScore.currentMultiplier = multiplier;
  console.log(`Multiplier set to ${multiplier}x`);

  if (scoringSystem.onScoreUpdate) {
    scoringSystem.onScoreUpdate(scoringSystem.gameScore);
  }
}

export function resetScore(scoringSystem: ScoringSystem): void {
  scoringSystem.gameScore.totalScore = 0;
  scoringSystem.gameScore.ballsDropped = 0;
  scoringSystem.gameScore.ballsLanded = 0;
  scoringSystem.gameScore.currentMultiplier = 1;
  scoringSystem.gameScore.history = [];

  console.log("Score reset");

  if (scoringSystem.onScoreUpdate) {
    scoringSystem.onScoreUpdate(scoringSystem.gameScore);
  }
}

export function getAverageScore(scoringSystem: ScoringSystem): number {
  if (scoringSystem.gameScore.ballsLanded === 0) return 0;
  return (
    scoringSystem.gameScore.totalScore / scoringSystem.gameScore.ballsLanded
  );
}

export function getLastNScores(
  scoringSystem: ScoringSystem,
  n: number
): ScoreEvent[] {
  const history = scoringSystem.gameScore.history;
  return history.slice(Math.max(0, history.length - n));
}
