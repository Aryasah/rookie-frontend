import React, { useContext, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import { useDispatch, useSelector } from "react-redux";
import socketService from "../../services/socketService";
import { IGameState, setInRoom } from "../../redux/gameSlice";

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
  const [roomName, setRoomName] = useState("");
  const [isJoining, setJoining] = useState(false);

  // const { setInRoom, isInRoom } = useContext(gameContext);
  const dispatch = useDispatch();
  const game = useSelector(
    (state: {
      game: IGameState;
    }) => state.game
  );

  const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    if (!roomName || roomName.trim() === "" || !socket) return;

    setJoining(true);

    const joined = await gameService
      .joinGameRoom(socket, roomName)
      .catch((err) => {
        alert(err);
      });

    if (joined) {
      dispatch(setInRoom(true));
    }


    setJoining(false);
  };
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    if (!socket) return;

    setJoining(true);

    const roomId = await gameService.createGameRoom(socket).catch((err) => {
      alert(err);
    });
    console.log("roomId: ", roomId)
    if (roomId !== null) dispatch(setInRoom(true));

    setJoining(false);
  };

  return (
    <>
      {!game.isInRoom && (
        <>
          <h1>Join Room</h1>
          <form onSubmit={joinRoom}>
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={handleRoomNameChange}
            />
            <button type="submit" disabled={isJoining}>
              Join Room
            </button>
          </form>
          <h2>Create Room</h2>
          <form onSubmit={createRoom}>
            <button type="submit" disabled={isJoining}>
              Create Room
            </button>
          </form>
        </>
      )}
    </>
  );
}
