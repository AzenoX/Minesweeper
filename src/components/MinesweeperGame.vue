<template>
  <div>
    <div id="board">
      <h1>Difficulty: {{ difficulty }}</h1>
      <div>
        <router-link to="/easy"><button @click="init">Easy</button></router-link>
        <router-link to="/medium"><button @click="init">Medium</button></router-link>
        <router-link to="/hard"><button @click="init">Hard</button></router-link>
        <router-link to="/insane"><button @click="init">Insane</button></router-link>
      </div>
      <br><br>

      <div class="cells">
        <div
            class="cell "
            @click.left="reveal($event)"
            @click.right.prevent="block($event)"
            v-for="cell in grid"
            :key="cell"
        >
          {{ cell }}
        </div>
      </div>
    </div>

    <div id="fireworks"></div>
  </div>
</template>

<script>
import {Fireworks} from "fireworks-js";

export default {
  name: "MinesweeperGame",
  props: {
    difficulty: {
      type: String,
      default: "easy"
    }
  },
  data() {
    return {
      grid: [...(new Array(30 * 30).fill(0))],
      gameIsRunning: true,
      percent: {
        easy: 0.03,
        medium: 0.08,
        hard: 0.12,
        insane: 0.4
      },
      fireworks: null,
      bomb: '💣',
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.grid = [];
      this.gameIsRunning = true;
      this.$toast.clear();
      this.$nextTick(() => {
        const wrapper = document.querySelector('.cells');
        wrapper.classList.remove('lose');
      });

      setTimeout(() => {
        this.grid = [...(new Array(30 * 30).fill(0))];

        this.grid.forEach((c, i) => {
          if (Math.random() <= this.percent[this.difficulty]) {
            this.grid[i] = this.bomb;
          }
        });

        this.updateCells();
      }, 100);
    },
    updateCells() {
      this.grid.forEach((c, i) => {
        if (this.grid[i] !== this.bomb) {
          const count = this.countSurroundBombs(i);
          this.grid[i] = count === 0 ? '' : count;

          this.$nextTick(() => {
            document.querySelectorAll('.cell')[i].classList.add('cell-count-' + count)
          })
        }
      });
    },
    countSurroundBombs(i) {
      // Delete if bound
      let cells = [];
      if (i - 30 <= 0) {
        cells = [
          this.grid[i - 1],
          this.grid[i + 1],
          this.grid[i + 30 - 1],
          this.grid[i + 30],
          this.grid[i + 30 + 1],
        ]
      } else if (i + 30 >= 30 * 30) {
        cells = [
          this.grid[i - 30 - 1],
          this.grid[i - 30],
          this.grid[i - 30 + 1],
          this.grid[i - 1],
          this.grid[i + 1],
        ]
      } else if (i % 30 === 0) {
        cells = [
          this.grid[i - 30],
          this.grid[i - 30 + 1],
          this.grid[i + 1],
          this.grid[i + 30],
          this.grid[i + 30 + 1],
        ]
      } else if (((i + 1) % 30) === 0) {
        cells = [
          this.grid[i - 30 - 1],
          this.grid[i - 30],
          this.grid[i - 1],
          this.grid[i + 30 - 1],
          this.grid[i + 30],
        ]
      } else {
        cells = [
          this.grid[i - 30 - 1],
          this.grid[i - 30],
          this.grid[i - 30 + 1],
          this.grid[i - 1],
          this.grid[i + 1],
          this.grid[i + 30 - 1],
          this.grid[i + 30],
          this.grid[i + 30 + 1],
        ]
      }

      return cells.filter(e => e === this.bomb).length;
    },
    reveal(e) {
      if (this.gameIsRunning) {
        const target = e.target;
        if (!target.classList.contains('blocked')) {
          target.classList.remove('hided');

          // Check for empty cells
          if (target.textContent === '') {
            const cells = [target];
            while (cells.length > 0) {
              const currentCell = cells.pop();
              const index = Array.from(currentCell.parentNode.children).indexOf(currentCell);

              if (index >= 0) {
                const adjacentIndexes = this.getAdjacentIndexes(index);
                adjacentIndexes.forEach(i => {
                  const adjacentCell = document.querySelectorAll('.cell')[i];
                  if (adjacentCell.classList.contains('hided')) {
                    adjacentCell.classList.remove('hided');
                    if (adjacentCell.textContent === '') {
                      cells.push(adjacentCell);
                    }
                  }
                });
              }
            }
          }

          // Win of the game
          if (Array.from(document.querySelectorAll('.cell')).filter(el => el.classList.contains('hided') && el.textContent !== this.bomb).length === 0) {
            this.win();
          }

          // Lose of the game
          if (target.textContent === this.bomb) {
            this.lose();
          }
        }
      }
    },
    getAdjacentIndexes(index) {
      const row = Math.floor(index / 30);
      const col = index % 30;
      const adjacentIndexes = [];
      for (let i = Math.max(0, row - 1); i <= Math.min(29, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(29, col + 1); j++) {
          if (i !== row || j !== col) {
            adjacentIndexes.push(i * 30 + j);
          }
        }
      }
      return adjacentIndexes;
    },
    block(e) {
      if (this.gameIsRunning) {
        if (e.target.classList.contains('hided')) {
          e.target.classList.toggle('blocked');
        }
      }
    },
    endOfGame() {
      this.gameIsRunning = false;
      document.querySelectorAll('.cell').forEach(el => el.classList.add('stopped'));
    },
    win() {
      this.endOfGame();

      setTimeout(() => {
        this.$toast.success('You win ! Click on a level above to restart a game.', {
          duration: 0,
          dismissible: false
        });
      }, 500);

    const container = document.querySelector('#fireworks');
    const fireworks = new Fireworks(container, {
      autoresize: false,
      opacity: 0.5,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.5,
      particles: 50,
      traceLength: 3,
      traceSpeed: 10,
      explosion: 5,
      intensity: 30,
      flickering: 50,
      lineStyle: 'round',
      hue: {
        min: 0,
        max: 360
      },
      delay: {
        min: 30,
        max: 60
      },
      rocketsPoint: {
        min: 50,
        max: 50
      },
      lineWidth: {
        explosion: {
          min: 1,
          max: 3
        },
        trace: {
          min: 1,
          max: 2
        }
      },
      brightness: {
        min: 50,
        max: 80
      },
      decay: {
        min: 0.015,
        max: 0.03
      },
      mouse: {
        click: false,
        move: false,
        max: 1
      }
    });
    fireworks.start();
      setTimeout(() => {
        fireworks.stop(true);
      }, 7000);
    },
    lose() {
      this.endOfGame();

      const wrapper = document.querySelector('.cells');
      wrapper.classList.add('lose');

      setTimeout(() => {
        this.$toast.error('You lost ! Click on a level above to restart a game.', {
          duration: 0,
          dismissible: false
        });
      }, 500);

      const container = document.querySelector('#fireworks');
      const fireworks = new Fireworks(container, {
        autoresize: false,
        opacity: 0.5,
        acceleration: 1.02,
        friction: 0.97,
        gravity: 0,
        particles: 100,
        traceLength: 1,
        traceSpeed: 10,
        explosion: 10,
        intensity: 60,
        flickering: 100,
        lineStyle: 'round',
        hue: {
          min: 21,
          max: 21
        },
        delay: {
          min: 30,
          max: 60
        },
        rocketsPoint: {
          min: 50,
          max: 50
        },
        lineWidth: {
          explosion: {
            min: 2,
            max: 3
          },
          trace: {
            min: 0.01,
            max: 0.01
          }
        },
        brightness: {
          min: 50,
          max: 80
        },
        decay: {
          min: 0.015,
          max: 0.03
        },
        mouse: {
          click: false,
          move: false,
          max: 1
        }
      });
      fireworks.start();
      setTimeout(() => {
        fireworks.stop(true);
      }, 5000);
    }
  }
}
</script>

<style scoped>
#board {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2;
}
#fireworks {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
h1 {
  margin: 0;
}
.cells {
  --count: 30;
  position: relative;

  margin: auto;
  width: calc(25px * var(--count));
  height: calc(25px * var(--count));
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  grid-template-rows: repeat(var(--count), 1fr);
}
.cells.lose {
  animation: tilt-n-move-shaking 0.25s ease forwards 1s 15;
}

.cell {
  position: relative;

  height: 25px;
  width: 25px;

  display: flex;
  justify-content: center;
  align-items: center;

  box-shadow: 0 0 2px 0 #000;
  font-weight: bold;

  cursor: pointer;
}
.cell.stopped {
  cursor: default !important;
}
.cell.hided::before {
  content: '';

  position: absolute;
  background: #e5e5e5;
  box-shadow: 0 0 2px 0 #000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999999;
}
.cell.blocked::after {
  content: '🚩';

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999999;
}
.cell-count-1 {
  color: #3b82f6;
}
.cell-count-2 {
  color: #22c55e;
}
.cell-count-3 {
  color: #ef4444;
}
.cell-count-4 {
  color: #4338ca;
}
.cell-count-5 {
  color: #a21caf;
}
.cell-count-6 {
  color: #b45309;
}
.cell-count-7 {
  color: #db2777;
}
.cell-count-8 {
  color: #065f46;
}

@keyframes tilt-n-move-shaking {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(5px, 5px) rotate(5deg); }
  50% { transform: translate(0, 0) rotate(0deg); }
  75% { transform: translate(-5px, 5px) rotate(-5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}
</style>