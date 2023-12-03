import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IGameState {
  rookPosition: { x: number; y: number };
  isInRoom: boolean;
  playerSymbol: "x" | "o";
  isPlayerTurn: boolean;
  isGameStarted: boolean;
  remainingTime: number;
}

const initialState: IGameState = {
  rookPosition: { x: 7, y: 7 },
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
  },
});

export const {
  setRookPosition,
  setInRoom,
  setPlayerSymbol,
  setPlayerTurn,
  setGameStarted,
  setRemainingTime,
} = gameSlice.actions;

export default gameSlice.reducer;
