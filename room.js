// room.js – система комнат через URL

function getRoomId() {
    const params = new URLSearchParams(window.location.search);
    let room = params.get('room');
    if (!room) {
        // если комнаты нет в URL — создаём новую
        room = 'room_' + Math.random().toString(36).substr(2, 6);
        // обновляем URL без перезагрузки
        const url = new URL(window.location);
        url.searchParams.set('room', room);
        window.history.replaceState({}, '', url);
    }
    return room;
}

function getPlayerName() {
    let name = localStorage.getItem('playerName');
    if (!name) {
        name = prompt('Введите ваше имя (или псевдоним):');
        if (name) localStorage.setItem('playerName', name);
    }
    return name;
}

// Сохраняем комнату в localStorage, чтобы знать, где мы
function setCurrentRoom(roomId) {
    localStorage.setItem('currentRoom', roomId);
}

// При загрузке страницы
const roomId = getRoomId();
setCurrentRoom(roomId);

// Добавляем внизу страницы информацию о комнате
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.createElement('div');
    footer.style.cssText = 'margin-top: 20px; font-size: 0.8rem; color: #5a4a6a; text-align: center; letter-spacing: 0.05em;';
    footer.innerHTML = `
        🕯️ Комната: <strong>${roomId}</strong>
        <span style="margin: 0 10px;">|</span>
        Игрок: <strong>${localStorage.getItem('playerName') || 'Аноним'}</strong>
        <br>
        <span style="font-size:0.7rem;">🔗 Поделись ссылкой с друзьями</span>
    `;
    document.querySelector('.container').appendChild(footer);
});
