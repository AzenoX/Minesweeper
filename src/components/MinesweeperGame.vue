<template>
  <div>
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
</template>

<script>
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
      percent: {
        easy: 0.03,
        medium: 0.08,
        hard: 0.12,
        insane: 0.4
      }
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.grid = [];

      setTimeout(() => {
        this.grid = [...(new Array(30 * 30).fill(0))];

        this.grid.forEach((c, i) => {
          if (Math.random() <= this.percent[this.difficulty]) {
            this.grid[i] = '💣';
          }
        });

        this.updateCells();
      }, 100);
    },
    updateCells() {
      this.grid.forEach((c, i) => {
        if (this.grid[i] !== '💣') {
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

      return cells.filter(e => e === '💣').length;
    },
    reveal(e) {
      if (!e.target.classList.contains('blocked')) {
        e.target.classList.remove('hided');
      }
    },
    block(e) {
      if (e.target.classList.contains('hided')) {
        e.target.classList.toggle('blocked');
      }
    }
  }
}
</script>

<style scoped>
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
</style>