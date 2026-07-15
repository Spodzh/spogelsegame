const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Хранилище комнат { roomId: { players: [ {id, name} ], game: null } }
const rooms = {};

// Раздача статики
app.use(express.static(path.join(__dirname, 'public')));

// Эндпоинт для создания комнаты
app.get('/create-room', (req, res) => {
    const roomId = uuidv4().slice(0, 8);
    rooms[roomId] = {
        players: [],
        game: null // пока не используется
    };
    res.json({ roomId });
});

// Эндпоинт для получения информации о комнате
app.get('/room/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    if (!rooms[roomId]) {
        return res.status(404).json({ error: 'Комната не найдена' });
    }
    res.json({ roomId, players: rooms[roomId].players });
});

// Socket.io
io.on('connection', (socket) => {
    console.log('Новый клиент:', socket.id);

    // Присоединение к комнате
    socket.on('join-room', ({ roomId, playerName }) => {
        if (!rooms[roomId]) {
            socket.emit('error', 'Комната не существует');
            return;
        }
        // Проверка на дубликат имени
        const existing = rooms[roomId].players.find(p => p.name === playerName);
        if (existing) {
            socket.emit('error', 'Имя уже занято');
            return;
        }
        const player = { id: socket.id, name: playerName };
        rooms[roomId].players.push(player);
        socket.join(roomId);
        socket.roomId = roomId;
        socket.playerName = playerName;

        // Отправляем обновлённый список игроков всем в комнате
        io.to(roomId).emit('players-update', rooms[roomId].players);
        console.log(`${playerName} присоединился к комнате ${roomId}`);
    });

    // Отключение
    socket.on('disconnect', () => {
        const roomId = socket.roomId;
        if (roomId && rooms[roomId]) {
            rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
            io.to(roomId).emit('players-update', rooms[roomId].players);
            console.log(`${socket.playerName || socket.id} покинул комнату ${roomId}`);
            // Если комната пуста, удаляем её (опционально)
            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
                console.log(`Комната ${roomId} удалена (пуста)`);
            }
        }
    });

    // Обработка сообщений (для чата или игровых команд)
    socket.on('game-action', (data) => {
        const roomId = socket.roomId;
        if (roomId) {
            // Пока просто ретранслируем
            socket.to(roomId).emit('game-action', { player: socket.playerName, data });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер SPOGELSEGAME запущен на http://localhost:${PORT}`);
});
