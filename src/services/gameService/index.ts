import { Socket } from "socket.io-client";
import { useResetGame } from "../../utility";

class GameService {
  private timer: NodeJS.Timeout | null = null;
  private remainingTimer: NodeJS.Timeout | null = null;
  public remainingTime: number = 30;


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
          this.throttleOpponentTimeUpdate(socket); // Throttle the opponent time update when the game starts
        }
      });
    });
  }
  public getTimer = () => {
    return this.timer;
  }
  public async createGameRoom(socket: Socket): Promise<string> {
    return new Promise((rs, rj) => {
      socket.emit("create_game");
      socket.on("room_created", ({roomId}) => rs(roomId));
      socket.on("room_create_error", ({ error }: { error: string }) => {
        rj(error);
      });

      // Listen for the "start_game" event to start the timer
      socket.on("start_game", (options: any) => {
        const { start, symbol } = options;

        if (start) {
          this.startTimer(socket, 30, () => {
            this.onTimerEnd(socket);
          }); // Start the timer when the game starts
          this.throttleOpponentTimeUpdate(socket); // Throttle the opponent time update when the game starts
        }
      });
    });
  }
  public async startTimer(
    socket: Socket,
    durationSeconds: number,
    onTimeout: () => void
  ) {
    this.remainingTime = durationSeconds;

    this.timer = setInterval(() => {
      this.remainingTime--;
      console.log("remainingTime", this.remainingTime);

      if (this.remainingTime <= 0) {
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
    this.stopThrottlingOpponentTimeUpdate(); // Stop throttling the opponent time update on each game update
  }
  public async gameWin(socket: Socket, message: string) {
    socket.emit("game_win", { message,reason:'win' });
  }

  public async onGameUpdate(socket: Socket, listener: (matrix: any) => void) {
    socket.on("on_game_update", ({ matrix }) => {
      this.startTimer(socket, 30, () => {
        this.onTimerEnd(socket);
      }); // Restart the timer on each game update
      this.throttleOpponentTimeUpdate(socket); // Throttle the opponent time update on each game update
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

  public async onGameWin(socket: Socket, listener: (message: string,reason:string) => void) {
    socket.on("on_game_win", ({ message,reason }) => {
      this.stopTimer(); // Stop the timer when the game is won
      listener(message,reason);
    });
  }

  private async onTimerEnd(socket: Socket) {
    // const {resetGame} = useResetGame()
    this.stopTimer();
    // Implement logic for what happens when the timer ends
    socket.emit("game_end_due_to_timer"); // Example: Notify the server that the game ended due to the timer
    socket.disconnect();
    alert("You ran out of time. You lose!");
    this.resetSocket(socket);
    setInterval(() => {
      window.location.href = "/";
    }, 2000);
    return
  }

  public resetSocket(socket: Socket) {
    if (socket) {
      socket.off("gameUpdate");
      socket.off("startGame");
      socket.off("gameWin");
      socket.off("opponentRemainingTimeUpdate");
    }
  }
  public async throttleOpponentTimeUpdate(socket: Socket) {
    // Throttle the opponent time update to every 5 seconds
    if (this.remainingTimer) {
      clearInterval(this.remainingTimer);
      this.remainingTimer = null;
    }

    this.remainingTimer = setInterval(() => {
      console.log("emitting opponent_time_update", this.remainingTime);
      // Emit the remaining time to the opponent
      socket.emit("opponent_time_update", {
        remainingTime: this.remainingTime,
      });
    }, 5000);
  }
  public async stopThrottlingOpponentTimeUpdate() {
    if (this.remainingTimer) {
      clearInterval(this.remainingTimer);
      this.remainingTimer = null;
    }
  }

  public async onOpponentRemainingTimeUpdate(
    socket: Socket,
    listener: (remainingTime: number) => void
  ) {
    socket.on("opponent_time_update", ({ remainingTime }) => {
      listener(remainingTime);
    });
  }

  // end game
  public async endGame(socket: Socket) {
    this.stopTimer();
    this.stopThrottlingOpponentTimeUpdate();
    this.resetSocket(socket);
  }
}

export default new GameService();
