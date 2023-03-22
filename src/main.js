import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import MinesweeperGame from './components/MinesweeperGame.vue'
import App from './App.vue'

const routes = [
    {
        path: '/:difficulty?',
        component: MinesweeperGame,
        props: (route) => ({
            difficulty: route.params.difficulty || 'medium'
        })
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

document.title = "Minesweeper | Alexis Hayat";

const app = createApp(App)

app.use(router)

app.mount('#app')
