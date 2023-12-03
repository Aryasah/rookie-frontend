import React, { useContext, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import { useDispatch, useSelector } from "react-redux";
import socketService from "../../services/socketService";
import { IGameState, setInRoom } from "../../redux/gameSlice";
import { motion } from "framer-motion";
import CustomButton from "../shared/customButton";
import { fadeAnimation } from "../../utility/config";

interface IJoinRoomProps {
  setShowJoin: React.Dispatch<React.SetStateAction<boolean>>;
}

export function JoinRoom(props: IJoinRoomProps) {
  const [roomName, setRoomName] = useState<string>("");
  const [isJoining, setJoining] = useState(false);

  // const { setInRoom, isInRoom } = useContext(gameContext);
  const dispatch = useDispatch();
  const game = useSelector((state: { game: IGameState }) => state.game);

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
      dispatch(setInRoom({
        isInRoom: true,
        roomId: roomName ? roomName : "",
      }));
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
    if (roomId === null || roomId === "") return;
    setRoomName(roomId ? roomId : "");
    if (roomId !== null) {
      
      dispatch(setInRoom({
        isInRoom: true,
        roomId: roomId ? roomId : "",
      }));
    }
    setJoining(false);
  };

  return (
    <>
      <motion.div className="absolute z-10 top-5 right-5" {...fadeAnimation}>
        <CustomButton
          type="filled"
          title="Go Back"
          handleClick={() => (props.setShowJoin(false))}
          customStyles={`w-fit px-4 py-2.5 font-bold text-sm`}
        />
      </motion.div>
      <motion.div
        className="flex flex-col items-center justify-center w-full h-full"
        {...fadeAnimation}
      >
        <div className="border border-black p-8 rounded-lg">
          {isJoining ? (
            <>
              <div className="animate-pulse flex-1 flex justify-center items-center">
                <div className="flex-1 flex justify-center items-center rounded-lg text-2xl text-black leading-3 font-bold">
                  Joining or Creating Room...
                </div>
              </div>
            </>
          ) : (
            <>
              <form className="flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Room Id"
                  value={roomName}
                  onChange={handleRoomNameChange}
                  className="w-80 px-4 py-2.5 text-black border border-black rounded-lg outline-none focus:ring-2 focus:ring-black mb-4"
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  onClick={joinRoom}
                  className="px-4 py-2.5 text-white bg-black rounded-lg"
                >
                  Join Room
                </button>
                <div className="mt-4 text-gray-600">Or</div>
                <button
                  type="button"
                  onClick={createRoom}
                  className="mt-2 px-4 py-2.5 text-white bg-black rounded-lg"
                >
                  Create Room
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>

      {/* {!game.isInRoom && (
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
      )} */}
    </>
  );
}
