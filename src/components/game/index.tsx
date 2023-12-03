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
import { motion, AnimatePresence } from "framer-motion";
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation,
} from "../../utility/config";
import GameComponent from "./canvasComponent";
import { CircularProgressbar } from "react-circular-progressbar";
import CopyToClipboard from "react-copy-to-clipboard";
import CustomButton from "../shared/customButton";
import { toast } from "react-toastify";
import { showAlert } from "../../utility/customAlert";

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

  const [timer, setTimer] = useState(30);
  const [timerSelf, setTimerSelf] = useState(30);
  const [timerOther, setTimerOther] = useState(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (game.isGameStarted && game.isPlayerTurn) {
      interval = setInterval(() => {
        setTimerSelf((prevTimerSelf) => {
          return prevTimerSelf - 1;
        });
      }, 1000);
    } else if (game.isGameStarted && !game.isPlayerTurn) {
      interval = setInterval(() => {
        setTimerOther((prevTimerOther) => {
          return prevTimerOther - 1;
        });
      }, 1000);
    } else {
      // Reset timers if the game is not started or it's not player's turn
      setTimerSelf(30);
      setTimerOther(30);
    }

    // Cleanup function
    return () => {
      clearInterval(interval);
      setTimerSelf(30);
      setTimerOther(30);
    };
  }, [game.isGameStarted, game.isPlayerTurn]);

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
      gameService.onGameWin(
        socketService.socket,
        (message: string, reason: string) => {
          console.log("Here gameWin", message, reason);
          dispatch(setPlayerTurn(false));
          if (socketService?.socket) socketService.socket.disconnect();
          if (reason === "timer") {
            showAlert("you win", "Opponent Timed Out!,you won the game", () => {
              window.location.href = "/";
            });
          }
          if (reason === "disconnect") {
            showAlert("you win", "Opponent Left!,you won the game", () => {
              window.location.href = "/";
            });
          }
        }
      );
  };

  useEffect(() => {
    const handleOpponentRemainingTimeUpdate = () => {
      if (socketService.socket) {
        const unsubscribe = gameService.onOpponentRemainingTimeUpdate(
          socketService.socket,
          (time: number) => {
            console.log("Remaining Time", time);
            // dispatch(setRemainingTime(time));
          }
        );
        return () => {
          if (socketService.socket) {
            socketService.socket.off("opponentRemainingTimeUpdate");
          }
        };
      }
    };

    handleOpponentRemainingTimeUpdate();
  }, [socketService.socket, gameService, dispatch]);

  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
    return () => {
      gameService.stopThrottlingOpponentTimeUpdate();
      gameService.stopTimer();
      if (socketService.socket) {
        socketService.socket.off("gameUpdate");
        socketService.socket.off("startGame");
        socketService.socket.off("gameWin");
      }
    };
  }, [socketService.socket, gameService, dispatch]);

  return (
    <AnimatePresence>
      <motion.section className="home h-full" {...slideAnimation("left")}>
        <motion.header {...slideAnimation("down")}>
          <div className="flex-row flex">
            <img
              src="../assets/images/rook.png"
              alt="logo"
              className="w-8 h-8 object-contain"
            />
            <h5 className="uppercase text-2xl text-black font-bold px-2">
              rook's game
            </h5>
          </div>
        </motion.header>
        <motion.div
          className="flex flex-row justify-between w-[100%] md:w-full h-full flex-1  py-4 px-0"
          {...slideAnimation("down")}
        >
          <motion.div
            className={`
            ${
              !game.isGameStarted && "border-2 py-4"
            }  flex-1 flex flex-col justify-start items-center rounded-lg text-2xl text-black leading-3 py-4"
            `}
            {...headContainerAnimation}
            style={
              {
                width: "100%",
              }
            }
          >
            <motion.div {...headTextAnimation}>
              <h1 className="game-head-text">
                Welcome to <br className="xl:block hidden uppercase" /> 1x1
                Rook's Game
              </h1>
              <p className="max-w-md font-normal text-center text-gray-600 text-lg my-1">
                Game ID: {game.roomId}
                <CopyToClipboard
                  text={`${game.roomId}`}
                  onCopy={() =>
                    showAlert("Copied", "Game ID Copied to Clipboard", () => {})
                  }
                >
                  <span className="text-xl px-1 text-gray-500 cursor-pointer">
                    &#x1F4CB;
                  </span>
                </CopyToClipboard>
              </p>
            </motion.div>
            <motion.div
              {...headContentAnimation}
              className={`flex ${
                game.isGameStarted && "border-2 my-2"
              }  rounded-lg flex-col gap-5 flex-1 w-full justify-center items-center `}
            >
              {game.isGameStarted ? (
                <>
                  <div className="game-area">
                    <div className="playerSection pt-2 player-top">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CircularProgressbar
                          styles={{
                            root: {
                              height: "78px",
                              width: "78px",
                              position: "absolute",
                              top: "20px",
                              zIndex: "1",
                            },
                            path: {
                              stroke: "#3DD771",
                            },
                            trail: {
                              stroke: "#2B2B2B",
                            },
                          }}
                          value={timerOther / 30}
                          maxValue={1}
                          counterClockwise
                        />
                      </div>
                      <img
                        className="profileIcon"
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=opponent`}
                        alt=""
                      />
                      <div className="text top">Opponent</div>
                      <div className="turn">
                        {game.isPlayerTurn ? "" : "Opponents Turn"}
                      </div>
                    </div>
                    <div className="py-2">
                      <GameComponent />
                    </div>
                    <div className="playerSection player-bottom">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CircularProgressbar
                          styles={{
                            root: {
                              height: "78px",
                              width: "78px",
                              position: "absolute",
                              top: "20px",
                              zIndex: "1",
                            },
                            path: {
                              stroke: "#3DD771",
                            },
                            trail: {
                              stroke: "#2B2B2B",
                            },
                          }}
                          value={timerSelf / 30}
                          maxValue={1}
                          counterClockwise
                        />
                      </div>
                      <img
                        className="profileIcon z-100"
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=you`}
                        alt=""
                      />
                      <div className="text bottom">You </div>
                      <div className="turn">
                        {game.isPlayerTurn ? "Your Turn" : ""}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="animate-pulse max-w-fit font-normal text-gray-600 text-center px-4 text-base md:text-xl">
                    {game.isGameStarted
                      ? game.isPlayerTurn
                        ? "Your Turn"
                        : "Other Player's Turn"
                      : "Waiting for Other Player to Join to Start the Game!"}
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
    </AnimatePresence>
  );
}
