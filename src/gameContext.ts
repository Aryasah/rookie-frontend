import React from "react";

export interface IGameContextProps {
  rookPostion: { x: number; y: number };
  setRookPosition: (position: { x: number; y: number }) => void;
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSymbol: "x" | "o";
  setPlayerSymbol: (symbol: "x" | "o") => void;
  isPlayerTurn: boolean;
  setPlayerTurn: (turn: boolean) => void;
  isGameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  remainingTime: number;
  setRemainingTime: (time: number) => void;
}

const defaultState: IGameContextProps = {
  rookPostion: { x: 7, y: 7 },
  setRookPosition: () => {},
  isInRoom: false,
  setInRoom: () => {},
  playerSymbol: "x",
  setPlayerSymbol: () => {},
  isPlayerTurn: false,
  setPlayerTurn: () => {},
  isGameStarted: false,
  setGameStarted: () => {},
  remainingTime: 30,
  setRemainingTime: () => {},
};

export default React.createContext(defaultState);
