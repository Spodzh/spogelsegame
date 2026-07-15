// Подключение к серверу Socket.io
const socket = io();

// Функция создания комнаты
async function createRoom() {
    try {
        const response = await fetch('/create-room');
        const data = await response.json();
        return data.roomId;
    } catch (err) {
        console.error('Ошибка создания комнаты:', err);
        return null;
    }
}

// Функция получения информации о комнате
async function getRoomInfo(roomId) {
    try {
        const response = await fetch(`/room/${roomId}`);
        if (!response.ok) throw new Error('Комната не найдена');
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Ошибка получения комнаты:', err);
        return null;
    }
}

// Присоединение к комнате
function joinRoom(roomId, playerName) {
    return new Promise((resolve, reject) => {
        socket.emit('join-room', { roomId, playerName });
        socket.once('players-update', (players) => {
            resolve(players);
        });
        socket.once('error', (msg) => {
            reject(new Error(msg));
        });
        // Таймаут на случай, если ответа нет
        setTimeout(() => reject(new Error('Таймаут соединения')), 5000);
    });
}

// Прослушивание обновлений игроков
function onPlayersUpdate(callback) {
    socket.on('players-update', callback);
}

// Отправка игрового действия
function sendGameAction(data) {
    socket.emit('game-action', data);
}

// Получение игровых действий
function onGameAction(callback) {
    socket.on('game-action', callback);
}

// Экспорт функций (если используем модули, но пока просто глобальные)
window.SpogelseGame = {
    createRoom,
    getRoomInfo,
    joinRoom,
    onPlayersUpdate,
    sendGameAction,
    onGameAction
};
