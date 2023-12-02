import { useEffect, useState } from "react";
import "./App.css";
import GameContext, { IGameContextProps } from "./gameContext";
import socketService from "./services/socketService";
import { JoinRoom } from "./components/joinRoom";
import { Game } from "./components/game";

// const AppContainer = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   padding: 1em;
// `;

// const WelcomeText = styled.h1`
//   margin: 0;
//   color: #8e44ad;
// `;

// const MainContainer = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"x" | "o">("x");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [rookPostion, setRookPosition] = useState({x: 0, y: 0});
  const [remainingTime, setRemainingTime] = useState(0);

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


  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    playerSymbol,
    setPlayerSymbol,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    rookPostion,
    setRookPosition,
    remainingTime: remainingTime,
    setRemainingTime: setRemainingTime,
  };

  return (
    <GameContext.Provider value={gameContextValue}>
      {/* <AppContainer>
        <WelcomeText>Welcome to Tic-Tac-Toe</WelcomeText>
        <MainContainer>
        </MainContainer>
      </AppContainer> */}
      {/* <JoinRoom/>
      <Game /> */}
      {!isInRoom && <JoinRoom />}
      {isInRoom && <Game />}
    </GameContext.Provider>
  );
}

export default App;
