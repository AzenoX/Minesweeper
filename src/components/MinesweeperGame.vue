<template>
  <div>
    <div id="board">
      <h1 class="white-text">Difficulty: {{ difficulty }}</h1>
      <div>
        <router-link to="/easy"><button class="waves-effect waves-light blue btn" style="margin-right: 2px; margin-left: 2px;" @click="init">Easy</button></router-link>
        <router-link to="/medium"><button class="waves-effect waves-light blue btn" style="margin-right: 2px; margin-left: 2px;" @click="init">Medium</button></router-link>
        <router-link to="/hard"><button class="waves-effect waves-light blue btn" style="margin-right: 2px; margin-left: 2px;" @click="init">Hard</button></router-link>
        <router-link to="/insane"><button class="waves-effect waves-light blue btn" style="margin-right: 2px; margin-left: 2px;" @click="init">Insane</button></router-link>
      </div>
      <br>

      <div class="cells">
        <div
            class="cell hided"
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
      size: 30,
      grid: [],
      gameIsRunning: true,
      percent: {
        easy: 0.03,
        medium: 0.08,
        hard: 0.12,
        insane: 0.4
      },
      fireworks: null,
      bomb: '💣',
      statusBlocked: 'blocked',
      statusHided: 'hided'
    }
  },
  created() {
    this.init();
  },
  mounted() {
    let materialDesignScript = document.createElement('script')
    materialDesignScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js')
    document.head.appendChild(materialDesignScript)

    let materialDesignStyle = document.createElement('link')
    materialDesignStyle.setAttribute('rel', 'stylesheet')
    materialDesignStyle.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css')
    document.head.appendChild(materialDesignStyle)

    let materialDesignIcons = document.createElement('link')
    materialDesignIcons.setAttribute('rel', 'stylesheet')
    materialDesignIcons.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons')
    document.head.appendChild(materialDesignIcons)
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
        // Create an empty grid
        const grid = new Array(this.size).fill(null).map(() => new Array(this.size).fill(null));

        // Fill the grid with bombs
        const numBombs = Math.floor(this.size * this.size * this.percent[this.difficulty]);
        let bombsPlaced = 0;
        while (bombsPlaced < numBombs) {
          const row = Math.floor(Math.random() * this.size);
          const col = Math.floor(Math.random() * this.size);
          if (grid[row][col] !== this.bomb) {
            grid[row][col] = this.bomb;
            bombsPlaced++;
          }
        }

        // Fill in the numbers
        for (let row = 0; row < this.size; row++) {
          for (let col = 0; col < this.size; col++) {
            if (grid[row][col] === null) {
              const numSurroundingBombs = this.countSurroundBombs(grid, row, col);
              grid[row][col] = numSurroundingBombs === 0 ? '' : numSurroundingBombs;
            }
          }
        }

        // Flatten the grid and update the cells
        this.grid = grid.flat();
        setTimeout(() => {
          this.updateCells();

          // Add hint
          if (this.difficulty === 'insane') {
            document.querySelector('.cell.cell-count-')?.classList.remove('hided');
          }
        }, 100);
      }, 100);
    },
    updateCells() {
      this.grid.forEach((cell, i) => {
        const count = cell === '' ? '' : parseInt(cell);
        document.querySelectorAll('.cell')[i].classList.add('cell-count-' + count);
        if (cell === '') {
          document.querySelectorAll('.cell')[i].textContent = '';
        }
      });
    },
    countSurroundBombs(grid, row, col) {
      let count = 0;
      for (let i = Math.max(0, row - 1); i <= Math.min(this.size - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(this.size - 1, col + 1); j++) {
          if (grid[i][j] === this.bomb) {
            count++;
          }
        }
      }
      return count;
    },
    reveal(e) {
      if (this.gameIsRunning) {
        const target = e.target;
        if (!target.classList.contains(this.statusBlocked)) {
          target.classList.remove(this.statusHided);

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
                  if (adjacentCell.classList.contains(this.statusHided) && !adjacentCell.classList.contains(this.statusBlocked)) {
                    adjacentCell.classList.remove(this.statusHided);
                    if (adjacentCell.textContent === '') {
                      cells.push(adjacentCell);
                    }
                  }
                });
              }
            }
          }

          // Win of the game
          if (Array.from(document.querySelectorAll('.cell')).filter(el => el.classList.contains(this.statusHided) && el.textContent !== this.bomb).length === 0) {
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
        if (e.target.classList.contains(this.statusHided)) {
          e.target.classList.toggle(this.statusBlocked);
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
          click: true,
          move: false,
          max: 10
        }
      });
      fireworks.start();
      setTimeout(() => {
        fireworks.waitStop(true);
      }, 10000);
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
        fireworks.waitStop(true);
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
  margin: 1vh;
  font-size: 3rem;
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

  background: #455a64;
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
  background: #37474f;
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
  color: #03a9f4;
}
.cell-count-2 {
  color: #4caf50;
}
.cell-count-3 {
  color: #f44336;
}
.cell-count-4 {
  color: #ab47bc;
}
.cell-count-5 {
  color: #fdd835;
}
.cell-count-6 {
  color: #fb8c00;
}
.cell-count-7 {
  color: #e91e63;
}
.cell-count-8 {
  color: #009688;
}

@keyframes tilt-n-move-shaking {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(5px, 5px) rotate(5deg); }
  50% { transform: translate(0, 0) rotate(0deg); }
  75% { transform: translate(-5px, 5px) rotate(-5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}
</style>