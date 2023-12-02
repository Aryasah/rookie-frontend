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
    });
  }

  public async startTimer(socket: Socket, durationSeconds: number) {
    let remainingTime = durationSeconds;

    this.timer = setInterval(() => {
      remainingTime--;

      if (remainingTime <= 0) {
        this.stopTimer();
        this.onTimerEnd(socket);
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
  }
  public async gameWin(socket: Socket, message: string) {
    socket.emit("game_win", { message });
  }

  public async onGameUpdate(socket: Socket, listener: (matrix: any) => void) {
    socket.on("on_game_update", ({ matrix }) => {
      this.stopTimer(); // Reset the timer on each game update
      listener(matrix);
    });
  }

  public async onStartGame(
    socket: Socket,
    durationSeconds: number,
    listener: (options: any) => void
  ) {
    this.startTimer(socket, durationSeconds); // Start the timer when the game starts
    socket.on("start_game", listener);
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
}

export default new GameService();
