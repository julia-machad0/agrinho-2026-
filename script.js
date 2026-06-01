// Configurações e Estado
const SEEDS = {
    corn: { emoji: '🌽', cost: 10, sell: 40, time: 5, xp: 10 },
    tomato: { emoji: '🍅', cost: 50, sell: 150, time: 8, xp: 30 },
    grape: { emoji: '🍇', cost: 200, sell: 700, time: 15, xp: 100 }
};

let state = { money: 0, level: 1, xp: 0, currentTool: 'plow', currentSeed: 'corn', tiles: [] };

// Animação de Entrada
window.onload = () => {
    setTimeout(() => document.getElementById('load-bar').style.width = '100%', 100);
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            document.getElementById('start-overlay').style.display = 'flex';
        }, 1000);
    }, 4000);
};

function startGame(diff) {
    state.money = (diff === 'easy' ? 1000 : (diff === 'med' ? 500 : 200));
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('game-container').style.display = 'grid';
    initGrid();
    updateUI();
    setInterval(gameTick, 1000);
}

function initGrid() {
    const grid = document.getElementById('farm-grid');
    for (let i = 0; i < 16; i++) {
        const tile = { status: 'grass', growth: 0, crop: null, isWet: false, el: document.createElement('div') };
        tile.el.className = 'tile';
        tile.el.onclick = () => handleTile(tile);
        tile.el.innerHTML = `<span class="icon"></span><div class="growth-bar"><div class="growth-fill"></div></div>`;
        grid.appendChild(tile.el);
        state.tiles.push(tile);
    }
}

function handleTile(tile) {
    const icon = tile.el.querySelector('.icon');
    if (state.currentTool === 'plow' && tile.status === 'grass') {
        tile.status = 'plowed'; tile.el.classList.add('plowed');
    } else if (state.currentTool === 'plant' && tile.status === 'plowed') {
        const s = SEEDS[state.currentSeed];
        if (state.money >= s.cost) {
            state.money -= s.cost; tile.status = 'planted';
            tile.crop = state.currentSeed; tile.growth = 0; icon.innerText = '🌱';
            tile.el.classList.add('planted');
        }
    } else if (state.currentTool === 'water' && tile.status !== 'grass') {
        tile.isWet = true; tile.el.classList.add('wet');
    } else if (state.currentTool === 'harvest' && tile.status === 'ready') {
        const s = SEEDS[tile.crop];
        state.money += s.sell; addXp(s.xp);
        tile.status = 'plowed'; tile.growth = 0; icon.innerText = '';
        tile.el.classList.remove('wet', 'ready');
    }
    updateUI();
}

function gameTick() {
    state.tiles.forEach(t => {
        if (t.status === 'planted') {
            let speed = (100 / SEEDS[t.crop].time) * (t.isWet ? 1.5 : 1);
            t.growth += speed;
            if (t.growth >= 100) {
                t.growth = 100; t.status = 'ready';
                t.el.querySelector('.icon').innerText = SEEDS[t.crop].emoji;
            }
            t.el.querySelector('.growth-fill').style.width = t.growth + '%';
        }
    });
}

function addXp(amt) {
    state.xp += amt;
    if (state.xp >= state.level * 100) {
        state.level++; state.xp = 0;
        if (state.level >= 5) document.getElementById('s-tomato').disabled = false;
        if (state.level >= 10) document.getElementById('s-grape').disabled = false;
    }
}

function setTool(tool, btn) {
    state.currentTool = tool;
    document.querySelectorAll('.side-panel .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function setSeed(seed, btn) {
    state.currentSeed = seed;
    document.querySelectorAll('[id^="s-"]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function updateUI() {
    document.getElementById('money').innerText = state.money;
    document.getElementById('level').innerText = state.level;
}