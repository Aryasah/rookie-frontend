import { useContext } from "react";
import gameContext from "../gameContext";
import gameService from "../services/gameService";
import socketService from "../services/socketService";

export const isValidMove = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) => {
  // Check if the move is either vertical or horizontal
  if (fromX !== toX && fromY !== toY) {
    console.log("Invalid move: Rook can only move vertically or horizontally.");
    return false;
  }

  // Check if the destination is within the chessboard boundaries
  if (toX < 0 || toX > 7 || toY < 0 || toY > 7) {
    console.log("Invalid move: Destination is outside the chessboard.");
    return false;
  }

  // Additional checks for special rules can be added here
  if (fromX === toX && fromY === toY) {
    console.log(
      "Invalid move: Destination is the same as the starting position."
    );
    return false;
  }

  return true; // Move is valid
};

export const useResetGame = () => {
  const {
    setPlayerSymbol,
    setPlayerTurn,
    setGameStarted,
    isGameStarted,
    setRookPosition,
    setRemainingTime,
  } = useContext(gameContext);

  const resetGame = () => {
    if (isGameStarted) {
      setGameStarted(false);
      setPlayerSymbol("x");
      setPlayerTurn(false);
      setRookPosition({ x: 0, y: 0 });
      setRemainingTime(0);
      gameService.stopThrottlingOpponentTimeUpdate();
      gameService.stopTimer();
      if (socketService.socket) {
        socketService.socket.off("gameUpdate");
        socketService.socket.off("startGame");
        socketService.socket.off("gameWin");
        socketService.socket.off("opponentRemainingTimeUpdate");
      }
    }
  };
  return {
    resetGame,
  }
};