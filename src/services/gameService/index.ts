import { Socket } from "socket.io-client";

class GameService {
  private timer: NodeJS.Timeout | null = null;
  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_game", { roomId });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }: { error: string }) => {
        rj(error);
      });

      // Listen for the "start_game" event to start the timer
      socket.on("start_game", (options: any) => {
        const { start, symbol } = options;

        if (start) {
          this.startTimer(socket, 30, () => {
            this.onTimerEnd(socket);
          }); // Start the timer when the game starts
        }
      });
    });
  }
  public async startTimer(
    socket: Socket,
    durationSeconds: number,
    onTimeout: () => void
  ) {
    let remainingTime = durationSeconds;

    this.timer = setInterval(() => {
      remainingTime--;
      console.log("remainingTime", remainingTime);

      if (remainingTime <= 0) {
        // this.stopTimer();
        onTimeout(); // Call the provided callback when the timer ends
      }
    }, 1000);
  }

  public stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async updateGame(socket: Socket, gameMatrix: any) {
    socket.emit("update_game", { matrix: gameMatrix });
    this.stopTimer(); // Reset the timer on each game update
  }
  public async gameWin(socket: Socket, message: string) {
    socket.emit("game_win", { message });
  }

  public async onGameUpdate(socket: Socket, listener: (matrix: any) => void) {
    socket.on("on_game_update", ({ matrix }) => {
      this.startTimer(socket, 30, () => {
        this.onTimerEnd(socket);
      }); // Restart the timer on each game update
      listener(matrix);
    });
  }

  public async onStartGame(
    socket: Socket,
    durationSeconds: number,
    listener: (options: any) => void
  ) {
    // Note: The "start_game" event will be used to start the timer
    socket.on("start_game", (options: any) => {
      listener(options);
    });
  }

  public async onGameWin(socket: Socket, listener: (message: string) => void) {
    socket.on("on_game_win", ({ message }) => {
      this.stopTimer(); // Stop the timer when the game is won
      listener(message);
    });
  }

  private async onTimerEnd(socket: Socket) {
    this.stopTimer();
    // Implement logic for what happens when the timer ends
    socket.emit("game_end_due_to_timer"); // Example: Notify the server that the game ended due to the timer
  }
  public async throttleOpponentTimeUpdate(socket: Socket) {
    // Throttle the opponent time update to every 5 seconds
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.timer = setInterval(() => {
      // Emit the remaining time to the opponent
      socket.emit("opponent_time_update", { remainingTime: 30 });
    }, 5000);
  }

  public async onOpponentRemainingTimeUpdate(
    socket: Socket,
    listener: (remainingTime: number) => void
  ) {
    socket.on("opponent_time_update", ({ remainingTime }) => {
      listener(remainingTime);
    });
  }
}

export default new GameService();
