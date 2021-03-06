import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

export interface GameStructure {
  board: string[];
  status: string;
  turn: string;
  gameHistory: string[][];
  players: string[];
  winner: string | null;
}

interface ReturnValue {
  board: string[];
  status: string;
  winner: string | null;
  history: string[][];
  players: string[];
  resetGame: () => void;
  handleClick: (index: number) => void;
  handleRestart: () => void;
  handleStart: (players: string[]) => void;
}

export class GameStructure implements GameStructure {
  constructor(init?: GameStructure) {
    Object.assign(this, init);
  }
}

export default function useTicTacToe(): ReturnValue {
  const newGame = new GameStructure();
  newGame.board = Array(9).fill("");
  newGame.status = "created";
  newGame.turn = "X";
  newGame.players = ["One", "Two"];
  newGame.winner = "";
  newGame.gameHistory = [newGame.board];

  const [currentGame, setCurrentgame] = useLocalStorage(
    "currentGame",
    new GameStructure(newGame)
  );

  const [board, setBoard] = useState(currentGame.board);
  const [turn, setTurn] = useState(currentGame.turn);
  const [winner, setWinner] = useState<string | null>(null);
  const [status, setStatus] = useState(currentGame.status);
  const [players, setPlayers] = useState(currentGame.players);
  const [stepNumber, setStepNumber] = useState(0);
  const [history, setHistory] = useState(currentGame.gameHistory);

  const saveGame = useCallback(() => {
    const game = new GameStructure();
    game.board = board;
    game.status = status;
    game.turn = turn;
    game.players = players;
    game.gameHistory = history;
    game.winner = winner;
    setCurrentgame(game);
  }, [board, players, history, setCurrentgame, status, turn, winner]);

  useEffect(() => {
    if (status !== "started") return;
    const winningPositions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let winningPositionsIndex = 0;
    let winner: string | null = null;
    while (winningPositionsIndex < winningPositions.length && !winner) {
      console.log(winningPositionsIndex);
      const boardPositionsToCheck = winningPositions[winningPositionsIndex];
      const boardValuesToCkeck = boardPositionsToCheck.map(
        (index) => board[index]
      );

      const checkingValue = boardValuesToCkeck[0];
      const isFinished = boardValuesToCkeck.every(
        (value) => value === checkingValue && checkingValue
      );
      winner = !isFinished ? null : checkingValue;
      winningPositionsIndex++;
    }
    if (winner) {
      setWinner(winner === "X" ? players[0] : players[1]);
      setStatus("finished");
      saveGame();
      return;
    }
    setStatus(board.filter((value) => !value).length ? "started" : "finished");
  }, [board, players, status, saveGame]);

  const handleClick = (index: number): void => {
    if (index < 0 || index > 9 || winner) return;
    const newBoard = [...board];
    newBoard.splice(index, 1, turn);
    setBoard(newBoard);
    const newTurn = turn === "X" ? "O" : "X";
    setTurn(newTurn);

    const timeInHistory = history.slice(0, stepNumber + 1);
    setStepNumber(timeInHistory.length);
    const current = timeInHistory[stepNumber];
    const squares = [...current];
    squares[index] = turn ? "X" : "O";
    // if (index === 0) {
    //   setHistory([squares]);
    // } else {
    setHistory([...timeInHistory, squares]);
    // }
    saveGame();
  };

  const handleStart = (players: string[]) => {
    setBoard(Array(9).fill(""));
    setPlayers(players);
    setTurn("X");
    setStatus("started");
    setHistory([Array(9).fill(null)]);
    saveGame();
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(""));
    setWinner("");
    setStatus("created");
    setHistory([Array(9).fill(null)]);
    saveGame();
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setPlayers([]);
    setTurn("X");
    setStatus("created");
    setWinner("");
    setHistory([Array(9).fill(null)]);
    const game = new GameStructure();
    game.board = board;
    game.status = status;
    game.turn = turn;
    game.players = players;
    game.gameHistory = history;
    game.winner = winner;
    console.log(game);
    setCurrentgame(game);
  };

  return {
    board,
    status,
    winner,
    history,
    players,
    resetGame,
    handleClick,
    handleRestart,
    handleStart,
  };
}
