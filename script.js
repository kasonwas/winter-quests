// Данные игрока
const player = {
    lvl: 1,
    hp: 100,
    maxHp: 100,
    atk: 15,
    xp: 0,
    nextXp: 100
};

// База данных врагов
const enemies = {
    creeps: [
        { name: "Злой Снеговик", img: "снегич.png" },
        { name: "Ледяной Волк", img: "волкчи.png" },
        { name: "Гном-грабитель", img: "гномыч.png" }
    ],
    bosses: [
        { name: "Снежная Королева", img: "снежкоролев.png " },
        { name: "Йети-разрушитель", img: "йети.png" },
        { name: "Ледяной Дракон", img: "драконыч.png" }
    ],
    special: { name: "🎁 Живой Подарок", img: "https://img.icons8.com/color/100/christmas-gift.png" }
};

let currentEnemy = null;
let enemyCounter = 0;
let skillCD = { power: 0, fire: 0 };
let isGameActive = true;

const el = {
    lvl: document.getElementById('lvl'),
    atk: document.getElementById('atk'),
    pHpFill: document.getElementById('player-hp-fill'),
    pHpText: document.getElementById('player-hp-text'),
    pXpFill: document.getElementById('xp-fill'),
    pXpText: document.getElementById('xp-text'),
    eWin: document.getElementById('enemy-window'),
    eName: document.getElementById('enemy-name'),
    eImg: document.getElementById('enemy-img'),
    eHpFill: document.getElementById('enemy-hp-fill'),
    eHpText: document.getElementById('enemy-hp-text'),
    eAtkText: document.getElementById('enemy-stats'),
    log: document.getElementById('log'),
    btnAtk: document.getElementById('btn-attack'),
    cdPower: document.getElementById('cd-power'),
    cdFire: document.getElementById('cd-fire')
};

function spawnEnemy() {
    if (!isGameActive) return;
    
    enemyCounter++;
    const diff = 1 + (enemyCounter * 0.2); // Коэффициент сложности
    
    let base;
    let isGift = Math.random() < 0.15; // 15% шанс на появление подарка
    let isBoss = !isGift && (enemyCounter % 4 === 0);

    if (isGift) {
        base = enemies.special;
        currentEnemy = { ...base, hp: 20, maxHp: 20, atk: 0, xp: 150 * diff, isBoss: false, isGift: true };
    } else if (isBoss) {
        base = enemies.bosses[Math.floor(Math.random() * enemies.bosses.length)];
        currentEnemy = { ...base, hp: Math.floor(180 * diff), maxHp: Math.floor(180 * diff), atk: Math.floor(10 * diff), xp: 120 * diff, isBoss: true };
    } else {
        base = enemies.creeps[Math.floor(Math.random() * enemies.creeps.length)];
        currentEnemy = { ...base, hp: Math.floor(40 * diff), maxHp: Math.floor(40 * diff), atk: Math.floor(6 * diff), xp: 35 * diff, isBoss: false };
    }

    el.eWin.classList.toggle('boss-active', currentEnemy.isBoss);
    updateUI();
    el.log.innerText = isGift ? "✨ ВАУ! Появился праздничный подарок!" : `Появился ${currentEnemy.name}!`;
}

function updateUI() {
    // Игрок
    el.lvl.innerText = player.lvl;
    el.atk.innerText = player.atk;
    el.pHpFill.style.width = (player.hp / player.maxHp * 100) + "%";
    el.pHpText.innerText = `${player.hp}/${player.maxHp}`;
    el.pXpFill.style.width = (player.xp / player.nextXp * 100) + "%";
    el.pXpText.innerText = `XP: ${player.xp}/${player.nextXp}`;

    // Враг
    el.eName.innerText = currentEnemy.name;
    el.eImg.src = currentEnemy.img;
    el.eHpFill.style.width = (currentEnemy.hp / currentEnemy.maxHp * 100) + "%";
    el.eHpText.innerText = `${currentEnemy.hp}/${currentEnemy.maxHp}`;
    el.eAtkText.innerText = `Урон врага: ${currentEnemy.atk}`;

    // Скиллы
    el.cdPower.innerText = skillCD.power > 0 ? `КД: ${skillCD.power}с` : "Готов";
    document.getElementById('skill-power').disabled = (skillCD.power > 0);
    el.cdFire.innerText = skillCD.fire > 0 ? `КД: ${skillCD.fire}с` : "Готов";
    document.getElementById('skill-fire').disabled = (skillCD.fire > 0);
}

// Пошаговый бой
function action(mult, type) {
    if (currentEnemy.hp <= 0 || player.hp <= 0) return;

    // 1. Ход игрока
    let pDmg = Math.floor(player.atk * mult * (0.8 + Math.random() * 0.4));
    currentEnemy.hp -= pDmg;
    el.log.innerText = `Вы ударили на ${pDmg}! `;

    // 2. Проверка смерти врага
    if (currentEnemy.hp <= 0) {
        currentEnemy.hp = 0;
        updateUI();
        win();
        return;
    }

    // 3. Ход врага (если не подарок)
    setTimeout(() => {
        if (currentEnemy.atk > 0) {
            let eDmg = Math.floor(currentEnemy.atk * (0.8 + Math.random() * 0.4));
            player.hp -= eDmg;
            el.eWin.classList.add('shake'); // Эффект атаки врага
            setTimeout(() => el.eWin.classList.remove('shake'), 300);
            el.log.innerText += `Враг ударил вас на ${eDmg}!`;
            
            if (player.hp <= 0) {
                player.hp = 0;
                gameOver();
            }
        } else {
            el.log.innerText += "Подарок просто дрожит...";
        }
        updateUI();
    }, 500);
    
    // Запуск кулдауна если это скилл
    if (type === 'power') skillCD.power = 6;
    if (type === 'fire') skillCD.fire = 12;

    updateUI();
}

function win() {
    player.xp += Math.floor(currentEnemy.xp);
    el.log.innerText = `Победа! Получено ${Math.floor(currentEnemy.xp)} опыта.`;
    
    if (player.xp >= player.nextXp) {
        lvlUp();
    }
    setTimeout(spawnEnemy, 1200);
}

function lvlUp() {
    player.lvl++;
    player.xp -= player.nextXp;
    player.nextXp = Math.floor(player.nextXp * 1.5);
    
    // Рост статов
    player.maxHp += 30;
    player.hp = player.maxHp; // Полное лечение
    player.atk += 7;
    
    alert(`🎊 НОВЫЙ УРОВЕНЬ: ${player.lvl}!\nЗдоровье увеличено до ${player.maxHp}\nУрон вырос!`);
}

function gameOver() {
    isGameActive = false;
    el.log.innerHTML = "<b style='color:red'>ВЫ ПОГИБЛИ!</b> Нажмите F5, чтобы начать заново.";
    el.btnAtk.disabled = true;
}

// Кнопки
el.btnAtk.onclick = () => action(1, 'norm');
document.getElementById('skill-power').onclick = () => action(3, 'power');
document.getElementById('skill-fire').onclick = () => action(5, 'fire');

// Таймер кулдаунов
setInterval(() => {
    if (skillCD.power > 0) skillCD.power--;
    if (skillCD.fire > 0) skillCD.fire--;
    updateUI();
}, 1000);

spawnEnemy();