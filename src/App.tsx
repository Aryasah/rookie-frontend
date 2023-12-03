import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { Game } from "./components/game";
import GameComponent from "./components/game/canvasComponent";
import { JoinRoom } from "./components/joinRoom";
import { IGameState } from "./redux/gameSlice";
import socketService from "./services/socketService";
import { motion, AnimatePresence } from "framer-motion";
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation,
} from "./utility/config";
import CustomButton from "./components/shared/customButton";

function App() {
  const dispatch = useDispatch();
  const game = useSelector((state: { game: IGameState }) => state.game);
  const [showJoin, setShowJoin] = useState(false);

  const connectSocket = async () => {
    const socket = await socketService
      .connect("https://cuemath-rookie-backend.onrender.com")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <>
      <main className="app transition-all-ease-in">
        {game.isInRoom ? (
          <>
            <Game />
          </>
        ) : (
          <>
            <AnimatePresence>
              {!showJoin && (
                <motion.section className="home" {...slideAnimation("left")}>
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
                    className="flex md:flex-row  sm:flex-col justify-between w-full flex-1  py-4"
                    {...slideAnimation("down")}
                  >
                    <motion.div
                      className="home-content"
                      {...headContainerAnimation}
                    >
                      <motion.div {...headTextAnimation}>
                        <h1 className="head-text uppercase">
                          let's <br className="xl:block hidden" /> play
                        </h1>
                      </motion.div>
                      <motion.div
                        {...headContentAnimation}
                        className="flex flex-col gap-5"
                      >
                        <p className="max-w-md font-normal text-gray-600 text-base">
                          Embark on a strategic journey in a 1v1 Rook Move Game
                          on an 8x8 chessboard.{" "}
                          <strong>Outsmart your opponent</strong> with quick
                          thinking, navigating your rook to the bottom-left
                          corner for victory.
                        </p>
                        <CustomButton
                          type="filled"
                          title="Play Game"
                          handleClick={() => {
                            setShowJoin(true);
                          }}
                          customStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />
                      </motion.div>
                    </motion.div>
                    <motion.div
                      className="flex flex-col justify-center items-center w-fit md:py-0 sm:py-4 md:w-1/2 sm:w-full"
                      {...headContainerAnimation}
                    >
                      <motion.div
                        {...headContentAnimation}
                        className="border-2 border-gray-200 sm:w-full  rounded-lg p-4"
                      >
                        <h3 className="text-black font-bold text-xl uppercase mb-4">
                          How to play ?
                        </h3>
                        <div className="md:max-w-lg sm:max-w-2xl text-gray-600 text-lg">
                          <ul className="list-disc pl-4">
                            <li className="mb-2">
                              The game will be played on an 8x8 chessboard.
                            </li>
                            <li className="mb-2">
                              There will be two players, and they will take
                              turns to move the rook. Rooks start from the top
                              right square.
                            </li>
                            <li className="mb-2">
                              On each turn, a player can move the rook any
                              number of steps to the left or down, but not up,
                              right, or diagonally.
                            </li>
                            <li>
                              The player who reaches the bottom-left corner of
                              the board first wins the game.
                            </li>
                          </ul>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.section>
              )}
              {showJoin && <JoinRoom setShowJoin={setShowJoin} />}
            </AnimatePresence>
          </>
        )}
      </main>
    </>
  );
}

export default App;
