import React, { useContext, useEffect, useState } from "react";

import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { isValidMove, useResetGame } from "../../utility";

export function Game() {
  const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
    rookPostion,
    setRookPosition,
    remainingTime,
    setRemainingTime,
  } = useContext(gameContext);
  const { resetGame } = useResetGame();

  const [row, setRow] = useState(0);
  const [column, setColumn] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGameMatrix(column, row, playerSymbol);
  };

  const checkGameState = (rookPosition: {
    x: number;
    y: number;
    symbol: "x" | "o";
  }) => {
    if (rookPosition.x === 7 && rookPosition.y === 7) {
      if (rookPosition.symbol === playerSymbol) {
        return [true, false];
      }
      return [false, true];
    }
    return [false, false];
  };

  const updateGameMatrix = (column: number, row: number, symbol: "x" | "o") => {
    if (!isPlayerTurn) return alert("Not your turn!");
    if (!isValidMove(rookPostion.x, rookPostion.y, row, column))
      return alert("Invalid Move!");
    if (socketService.socket) {
      gameService.updateGame(socketService.socket, {
        rookPosition: { x: column, y: row },
        symbol,
      });
      const [currentPlayerWon, otherPlayerWon] = checkGameState({
        x: column,
        y: row,
        symbol,
      });
      if (currentPlayerWon && otherPlayerWon) {
        // game continues
      } else if (currentPlayerWon && !otherPlayerWon) {
        gameService.gameWin(socketService.socket, "You Lost!");
        alert("You Won!");
      }
      // else{
      //   gameService.gameWin(socketService.socket, "You Won!");
      //   alert("You Lost!");
      // }
      setPlayerTurn(false);
    }
  };

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (newGameState) => {
        console.log("Here", newGameState);
        setRookPosition(newGameState.rookPosition);
        checkGameState(newGameState.rookPosition);
        setPlayerTurn(true);
      });
  };

  const handleGameStart = () => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, 30, (options: any) => {
        const { message } = options; // Extract the 'message' property from 'options'
        console.log("Here handleGameStart", message);
        setGameStarted(true);
        setPlayerSymbol(options.symbol);
        if (options.start) setPlayerTurn(true);
        else setPlayerTurn(false);
      });
  };

  const handleGameWin = () => {
    if (socketService.socket)
      gameService.onGameWin(socketService.socket, (message: string) => {
        console.log("Here gameWin", message);
        setPlayerTurn(false);
        alert(message);
        // resetGame();
        if(socketService?.socket)
        socketService.socket.disconnect();
        window.location.reload();
      });
  };

  const handleOpponentRemainingTimeUpdate = () => {
    if (socketService.socket)
      gameService.onOpponentRemainingTimeUpdate(
        socketService.socket,
        (time: number) => {
          console.log("Remaining Time", time);
          setRemainingTime(time);
        }
      );
  };

  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
    handleOpponentRemainingTimeUpdate();
    return () => {
      gameService.stopThrottlingOpponentTimeUpdate();
      gameService.stopTimer();
      if (socketService.socket) {
        socketService.socket.off("gameUpdate");
        socketService.socket.off("startGame");
        socketService.socket.off("gameWin");
        socketService.socket.off("opponentRemainingTimeUpdate");
      }
    };
  }, []);

  return (
    <div>
      {!isGameStarted && (
        <h2>Waiting for Other Player to Join to Start the Game!</h2>
      )}
      {isGameStarted && (
        <>
          <h2>Game Started!</h2>
          <h2>Remaining Time: {remainingTime}</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Row:
              <input
                type="number"
                value={row}
                onChange={(e) => setRow(Number(e.target.value))}
              />
            </label>
            <label>
              Column:
              <input
                type="number"
                value={column}
                onChange={(e) => setColumn(Number(e.target.value))}
              />
            </label>
            <button type="submit">Submit</button>
          </form>
        </>
      )}
      <h2>{isPlayerTurn ? "Your Turn" : "Other Player's Turn"}</h2>
    </div>
  );
}
