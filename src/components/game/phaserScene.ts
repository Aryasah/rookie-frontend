// Import necessary modules and components
import "phaser";
import { toast } from "react-toastify";
import store from "../../redux/store";
import { updateGameState } from "../../redux/gameSlice";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";

// Define the Game class extending Phaser.Scene
export class Game extends Phaser.Scene {
  // @ts-ignore
  private vortex: Phaser.GameObjects.Image;
  // @ts-ignore
  private rook: Phaser.GameObjects.Image;
  private squareSize: number = 60;
  private boardSize: number = 8;
  private isRookMoving: boolean = false;
  private rookStartCol: number = 7;
  private rookStartRow: number = 0;
  private squares: Array<Array<Phaser.GameObjects.Graphics>> = [];
  private highlightedPaths: Array<Phaser.GameObjects.Image> = [];

  // Preload assets
  preload() {
    this.load.image("vortex", "./assets/images/vortex.png");
    this.load.image("rook", "./assets/images/rook.png");
    this.load.image("highlight", "./assets/images/highlight.png");
  }

  // Create the game scene
  create() {
    // Create the chessboard grid
    for (let row = 0; row < this.boardSize; row++) {
      this.squares[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        const x = col * this.squareSize;
        const y = row * this.squareSize;
        const color = (row + col) % 2 === 0 ? 0x262626 : 0x000000;

        const square = this.add.graphics();
        square.fillStyle(color, 1);
        square.fillRect(x, y, this.squareSize, this.squareSize);
        square.setInteractive(
          new Phaser.Geom.Rectangle(x, y, this.squareSize, this.squareSize),
          Phaser.Geom.Rectangle.Contains
        );

        // Handle square click
        square.on("pointerdown", (pointer: any) => {
          const clickedRow = Math.floor(pointer.y / this.squareSize);
          const clickedCol = Math.floor(pointer.x / this.squareSize);
          if (this.isRookMoving === false) {
            this.handleClick({ clickedRow, clickedCol });
          }
        });
        this.squares[row][col] = square;
      }
    }

    // Add rook and vortex to the scene
    this.rook = this.add.image(
      this.rookStartCol * 60 + 30,
      this.rookStartRow * 0 + 28,
      "rook"
    );
    this.vortex = this.add.image(30, 455, "vortex");

    // Highlight valid paths and subscribe to store updates
    this.highlightValidPaths();
    store.subscribe(this.handleStateUpdate);
  }

  // Highlight valid paths for the rook movement
  private highlightValidPaths() {
    this.clearHighlights();

    // Highlight the valid paths to the left of the rook
    for (let col = this.rookStartCol - 1; col >= 0; col--) {
      const x = col * this.squareSize;
      const y = this.rookStartRow * this.squareSize;
      const highlight = this.add.image(
        x + this.squareSize / 2,
        y + this.squareSize / 2,
        "highlight"
      );
      highlight.setOrigin(0.5);
      this.highlightedPaths.push(highlight);
    }

    // Highlight the valid paths below the rook
    for (let row = this.rookStartRow + 1; row < this.boardSize; row++) {
      const x = this.rookStartCol * this.squareSize;
      const y = row * this.squareSize;
      const highlight = this.add.image(
        x + this.squareSize / 2,
        y + this.squareSize / 2,
        "highlight"
      );
      highlight.setOrigin(0.5);
      this.highlightedPaths.push(highlight);
    }
  }

  // Clear all highlighted paths
  private clearHighlights() {
    this.highlightedPaths.forEach((highlight) => {
      highlight.destroy();
    });
    this.highlightedPaths = [];
  }

  // Handle state updates from the store
  private handleStateUpdate = () => {
    const gameState = store.getState().game;

    // Check if rook position has changed
    if (
      gameState.rookPosition.x !== this.rookStartRow ||
      gameState.rookPosition.y !== this.rookStartCol
    ) {
      const newRow = gameState.rookPosition.x;
      const newCol = gameState.rookPosition.y;
      const x = newCol * this.squareSize + 28;
      const y = newRow * this.squareSize + 30;

      // Animate rook movement
      this.tweens.add({
        targets: this.rook,
        x: x,
        y: y,
        duration: 400,
        ease: "Linear",
        onStart: () => {
          this.isRookMoving = true;
        },
        onComplete: () => {
          console.log("Rook moved to state", newRow, newCol);
          this.isRookMoving = false;
          this.rookStartRow = newRow;
          this.rookStartCol = newCol;
          this.highlightValidPaths();

          // Check if rook reaches the vortex
          if (newRow === 7 && newCol === 0) {
            if (gameState.isPlayerTurn) {
              alert("You Lose! The other player reached the vortex first.");
              console.log(
                "You Lose! The other player reached the vortex first."
              );
              if (socketService.socket)
                gameService.endGame(socketService.socket);
              setInterval(() => {
                window.location.href = "/";
              }, 3000);
            }
            return;
          }
        },
      });
    }
  };

  // Handle click event on a chessboard square
  private handleClick(params: { clickedRow: number; clickedCol: number }) {
    const { clickedRow, clickedCol } = params;
    const x = clickedCol * this.squareSize + 28;
    const y = clickedRow * this.squareSize + 30;
    let gameState = store.getState().game;

    // If it is not the player's turn, do nothing
    if (gameState.isPlayerTurn === false) {
      console.log("Not the user's turn");
      return;
    }

    // If rook clicks on itself, do nothing
    if (clickedRow === this.rookStartRow && clickedCol === this.rookStartCol) {
      return;
    }

    // Rook cannot go backwards or move diagonally
    if (
      clickedRow < this.rookStartRow ||
      clickedCol > this.rookStartCol ||
      (clickedRow !== this.rookStartRow && clickedCol !== this.rookStartCol)
    ) {
      return;
    }

    // Update game state and animate rook movement
    store.dispatch(
      updateGameState({
        row: clickedRow,
        column: clickedCol,
        symbol: gameState.playerSymbol,
      })
    );

    this.tweens.add({
      targets: this.rook,
      x: x,
      y: y,
      duration: 400,
      ease: "Linear",
      onStart: () => {
        this.isRookMoving = true;
      },
      onComplete: () => {
        console.log("Rook moved to", clickedRow, clickedCol);
        this.isRookMoving = false;
        this.rookStartRow = clickedRow;
        this.rookStartCol = clickedCol;
        this.highlightValidPaths();

        // Check if rook reaches the vortex
        if (clickedRow === 7 && clickedCol === 0) {
          alert("You Win! You reached the vortex before the other player.");
          console.log(
            "You Win! You reached the vortex before the other player."
          );
          if (socketService.socket) gameService.endGame(socketService.socket);
          setInterval(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }
      },
    });
  }
}
