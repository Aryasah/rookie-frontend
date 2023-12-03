import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { Game } from "./components/game";
import GameComponent from "./components/game/canvasComponent";
import { JoinRoom } from "./components/joinRoom";
import { IGameState } from "./redux/gameSlice";
import socketService from "./services/socketService";

function App() {
  const dispatch = useDispatch();
  const game = useSelector(
    (state: {
      game: IGameState;
      // Add other slices if you have them
    }) => state.game
  );

  const connectSocket = async () => {
    const socket = await socketService
      .connect("http://localhost:9000")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <>
      {!game.isInRoom && <JoinRoom />}
      {game.isInRoom && <Game />}
      <GameComponent />
    </>
  );
}

export default App;
