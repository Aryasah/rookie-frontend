import { useEffect, useState } from "react";
import { Game } from "./phaserScene";

const GameComponent = () => {
    const [game, setGame] = useState<Phaser.Game>();
    useEffect(() => {
    const _game = new Phaser.Game(
        {
            type: Phaser.AUTO,
            width: 480,
            height: 480,
            parent: "canvas",
            scene: [Game],
         
        }
    );

    setGame(_game);

    return (): void => {
        _game.destroy(true);
        setGame(undefined);
    };
}, []);
  // Return the host element where Phaser3 will append the canvas.
  return  <div id="canvas" />
};
export default GameComponent;
