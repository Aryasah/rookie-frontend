import React, { useContext, useEffect, useState } from "react";

import gameContext from "../../gameContext";
import { useDispatch, useSelector } from "react-redux";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { checkGameState, isValidMove, useResetGame } from "../../utility";
import {
  IGameState,
  setGameStarted,
  setPlayerSymbol,
  setPlayerTurn,
  setRemainingTime,
  setRookPosition,
  updateGameState,
} from "../../redux/gameSlice";

export function Game() {
  const dispatch = useDispatch();
  const game = useSelector(
    (state: {
      game: IGameState;
      // Add other slices if you have them
    }) => state.game
  );

  const [row, setRow] = useState(0);
  const [column, setColumn] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!game.isPlayerTurn) return alert("Not your turn!");
    if (!isValidMove(game.rookPosition.x, game.rookPosition.y, row, column))
      return alert("Invalid Move!");

    dispatch(
      updateGameState({ row: row, column: column, symbol: game.playerSymbol })
    );
  };

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (newGameState) => {
        console.log("Here", newGameState);
        dispatch(setRookPosition(newGameState.rookPosition));
        checkGameState(newGameState.rookPosition, game.playerSymbol);
        dispatch(setPlayerTurn(true));
      });
  };

  const handleGameStart = () => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, 30, (options: any) => {
        const { message } = options; // Extract the 'message' property from 'options'
        console.log("Here handleGameStart", message);
        dispatch(setGameStarted(true));
        dispatch(setPlayerSymbol(options.symbol));
        if (options.start) dispatch(setPlayerTurn(true));
        else dispatch(setPlayerTurn(false));
      });
  };

  const handleGameWin = () => {
    if (socketService.socket)
      gameService.onGameWin(socketService.socket, (message: string) => {
        console.log("Here gameWin", message);
        dispatch(setPlayerTurn(false));
        // alert(message);
        if (socketService?.socket) socketService.socket.disconnect();
        // window.location.reload();
      });
  };

  const handleOpponentRemainingTimeUpdate = () => {
    if (socketService.socket)
      gameService.onOpponentRemainingTimeUpdate(
        socketService.socket,
        (time: number) => {
          console.log("Remaining Time", time);
          dispatch(setRemainingTime(time));
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
      {!game.isGameStarted && (
        <h2>Waiting for Other Player to Join to Start the Game!</h2>
      )}
      {game.isGameStarted && (
        <>
          <h2>Game Started!</h2>
          <h2>Remaining Time: {game.remainingTime}</h2>
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
      <h2>{game.isPlayerTurn ? "Your Turn" : "Other Player's Turn"}</h2>
    </div>
  );
}
