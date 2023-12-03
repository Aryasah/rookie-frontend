import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import socketService from "../services/socketService";
import gameService from "../services/gameService";
import { checkGameState } from "../utility";

export interface IGameState {
  rookPosition: { x: number; y: number };
  isInRoom: boolean;
  playerSymbol: "x" | "o";
  isPlayerTurn: boolean;
  isGameStarted: boolean;
  remainingTime: number;
}

const initialState: IGameState = {
  rookPosition: { x: 0, y: 7 },
  isInRoom: false,
  playerSymbol: "x",
  isPlayerTurn: false,
  isGameStarted: false,
  remainingTime: 30,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setRookPosition: (
      state: IGameState,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.rookPosition = action.payload;
    },
    setInRoom: (state: IGameState, action: PayloadAction<boolean>) => {
      state.isInRoom = action.payload;
    },
    setPlayerSymbol: (state: IGameState, action: PayloadAction<"x" | "o">) => {
      state.playerSymbol = action.payload;
    },
    setPlayerTurn: (state: IGameState, action: PayloadAction<boolean>) => {
      state.isPlayerTurn = action.payload;
    },
    setGameStarted: (state: IGameState, action: PayloadAction<boolean>) => {
      state.isGameStarted = action.payload;
    },
    setRemainingTime: (state: IGameState, action: PayloadAction<number>) => {
      state.remainingTime = action.payload;
    },
    updateGameState: (state, action: PayloadAction<{ column: number; row: number; symbol: 'x' | 'o' }>) => {
        const { column, row, symbol } = action.payload;
  
        if (socketService.socket) {
          gameService.updateGame(socketService.socket, {
            rookPosition: { y: column, x: row },
            symbol,
          });
  
          const [currentPlayerWon, otherPlayerWon] = checkGameState({
            y: column,
            x: row,
            symbol,
          }, state.playerSymbol);

          console.log('currentPlayerWon', currentPlayerWon, 'otherPlayerWon', otherPlayerWon, 'symbol', symbol, 'playerSymbol', state.playerSymbol);
  
          if (currentPlayerWon && otherPlayerWon) {
            // game continues
          } else if (currentPlayerWon && !otherPlayerWon) {
            gameService.gameWin(socketService.socket, 'You Lost!');
          }
  
          state.isPlayerTurn = false;
        }
      },
  },
});

export const {
  setRookPosition,
  setInRoom,
  setPlayerSymbol,
  setPlayerTurn,
  setGameStarted,
  setRemainingTime,
  updateGameState
} = gameSlice.actions;

export default gameSlice.reducer;
