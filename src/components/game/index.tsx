import React, { useContext, useEffect, useState } from "react";

import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";

// const GameContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   font-family: "Zen Tokyo Zoo", cursive;
//   position: relative;
// `;

export function Game() {
  const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
    setRookPosition,
  } = useContext(gameContext);

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
    return [false, true];
  };

  const updateGameMatrix = (column: number, row: number, symbol: "x" | "o") => {
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
        gameService.gameWin(socketService.socket, "The Game is a TIE!");
        alert("The Game is a TIE!");
      } else if (currentPlayerWon && !otherPlayerWon) {
        gameService.gameWin(socketService.socket, "You Lost!");
        alert("You Won!");
      }
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
      gameService.onStartGame(socketService.socket, 0, (options: any) => {
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
        console.log("Here", message);
        setPlayerTurn(false);
        alert(message);
      });
  };

  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
  }, []);

  return (
    <div>
      {!isGameStarted && (
        <h2>Waiting for Other Player to Join to Start the Game!</h2>
      )}
      {isGameStarted && (
        <>
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
