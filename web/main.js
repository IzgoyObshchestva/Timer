const main_box = document.getElementById('main_content');

async function add_item(){
    const name = document.getElementById('formName').value;
    const h = document.getElementById('formHH').value;
    const m = document.getElementById('formMM').value;
    const s = document.getElementById('formSS').value;
    
    let time = (parseInt(h, 10) || 0) * 3600 + (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
    
    let item = await eel.add_data(name, time)();

    const hours = Math.floor(item['time'] / 3600).toString().padStart(2, '0');
    const mins = Math.floor((item['time'] % 3600) / 60).toString().padStart(2, '0');
    const secs = (item['time'] % 60).toString().padStart(2, '0');

    let text = `
    <div id="${item['id']}" class="test" data-time="${item['time']}">
        <div class="test2">
            ${item['name']}
        </div>
        <div class="test2">
            <div class="hh item">${hours}</div>
            <div class="aa">:</div>
            <div class="mm item">${mins}</div>
            <div class="aa">:</div>
            <div class="ss item">${secs}</div>
        </div>
        <div class="test2">
            <button class="bt" onclick="startTimer('${item['id']}')">Старт</button>
            <button class="bt" onclick="pauseTimer()">Стоп</button>
            <button class="bt" onclick="resetTimer('${item['id']}')">Удалить</button>
        </div>
    </div>
    `
    main_box.innerHTML += text;
    closeModal();
}

async function update_item(id, name, time){
    const modal = document.getElementById(id);
    modal.dataset.time = time;
    await eel.update_data(id, name, time)();
    closeModal();
}

async function delete_item(id){
    const modal = document.getElementById(id);
    if (modal) {
        modal.remove(); // полностью удаляем из DOM
    }
    await eel.delete_data(Number(id))();
    closeModal();
}

async function get_item(id) {
    return await eel.get_data_item(id)
}


function getItemWindow(action, id, text){
    if (action === 'delete'){
        return `
        <div class="modal_window_box_h2">
            <h2 class="modal_window_h2">Удаление</h2>
            <span id="closeModalBtn" class="modal_window_bt_close">&times;</span>
        </div>

        <p class='p'>Вы уверены что хотите удалить "${text}"?</p>
        
        <button onclick="delete_item(${id})" class="modal_window_button bt">
            Удалить
        </button>
        `
    } else if (action === 'update') {
        let res = get_item(id);
        const hours = Math.floor(res['time'] / 3600).toString().padStart(2, '0');
        const mins = Math.floor((res['time'] % 3600) / 60).toString().padStart(2, '0');
        const secs = (res['time'] % 60).toString().padStart(2, '0');
        return `
        <div class="modal_window_box_h2">
            <h2 class="modal_window_h2">Изменение</h2>
            <span id="closeModalBtn" class="modal_window_bt_close">&times;</span>
        </div>

        <input id="formName" type="text" value='${res['name']}' placeholder="Название" class="modal_window_input">
        <input id="formHH" type="text" value='${hours}' placeholder="Часы" class="modal_window_input">
        <input id="formMM" type="text" value='${mins}' placeholder="Минуты" class="modal_window_input">
        <input id="formSS" type="text" value='${secs}' placeholder="Секунды" class="modal_window_input">
        
        <button onclick="update_item()" class="modal_window_button bt">
            Изменить
        </button>
        `
    } else {
        return `
        <div class="modal_window_box_h2">
            <h2 class="modal_window_h2">Добавление</h2>
            <span id="closeModalBtn" class="modal_window_bt_close">&times;</span>
        </div>
        <div class="zxczxc">
            <input id="formName" type="text" placeholder="Название" class="modal_window_input">
            <input id="formHH" type="text" placeholder="Часы" class="modal_window_input">
            <input id="formMM" type="text" placeholder="Минуты" class="modal_window_input">
            <input id="formSS" type="text" placeholder="Секунды" class="modal_window_input">
        </div>
        
        <button onclick="add_item()" class="modal_window_button bt">
            Добавить
        </button>
        `
    }
}


function openWindow(action, id, text) {
    // Проверяем, не открыто ли уже окно (чтобы не плодить дубли)
    if (document.getElementById('actionModal')) {
        return;
    }

    // Создаём затемнённый фон (overlay)
    const overlay = document.createElement('div');
    overlay.id = 'actionModal';
    overlay.classList.add('overlay_modal');

    // Создаём само окно
    const modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');


    modalWindow.innerHTML = getItemWindow(action, id, text);
    
    // Добавляем анимацию появления (необязательно, но красиво)
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalAppear {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Вставляем окно в overlay
    overlay.appendChild(modalWindow);

    // Добавляем весь overlay в конец body
    document.body.appendChild(overlay);

    // === Обработчики закрытия ===
    
    // Крестик
    document.getElementById('closeModalBtn').onclick = closeModal;
    
    // Клик по фону
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    };

    // Esc на клавиатуре
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeModal() {
    const modal = document.getElementById('actionModal');
    if (modal) {
        modal.remove(); // полностью удаляем из DOM
    }
}


let timerId;          // ID интервала
let secondsLeft; // Начальное время в секундах (можно изменить)
let idBoxLeft;


function updateDisplay(box_id) {
    const hours = Math.floor(secondsLeft / 3600).toString().padStart(2, '0');
    const mins = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
    const secs = (secondsLeft % 60).toString().padStart(2, '0');
    
    const display = document.getElementById(box_id);
    const name = display.querySelector('.name').textContent.trim();
    const hh = display.querySelector('.hh');
    const mm = display.querySelector('.mm');
    const ss = display.querySelector('.ss');


    hh.textContent = hours;
    mm.textContent = mins;
    ss.textContent = secs;

    if ((secondsLeft % 10) === 0) {
        update_item(Number(box_id), name, Number(secondsLeft));
    }
    
    if (secondsLeft <= 0) {
        clearInterval(timerId);
        clearInterval(idBoxLeft);
        display.remove();
        delete_item(box_id);
        hh.textContent = "00";
        mm.textContent = "00";
        ss.textContent = "00";
        alert("Время вышло!");
    }
}


function getTime(box_id) {
    const box = document.getElementById(box_id);
    time_box = box.dataset.time; // "admin"
    secondsLeft = time_box;
    idBoxLeft = box_id;
}


function startTimer(box_id) {
    if (timerId) return; // Уже запущен

    console.log(idBoxLeft)

    if (box_id !== idBoxLeft) {
        getTime(box_id);
        pauseTimer(idBoxLeft);
    }


    timerId = setInterval(() => {
        secondsLeft--;
        updateDisplay(box_id);
    }, 1000);

    updateDisplay(box_id);
}

function pauseTimer(box_id) {
    const display = document.getElementById(box_id);
    const name = display.querySelector('.name').textContent.trim();
    update_item(Number(box_id), name, Number(secondsLeft));
    
    clearInterval(timerId);
    timerId = null;
}

function resetTimer(box_id) {
    pauseTimer();
    getTime(box_id); // Сброс на начальное значение
    updateDisplay(box_id);
}



async function init() {
    let result = await eel.read_data()();
    
    result.forEach(item => {
        const hours = Math.floor(item['time'] / 3600).toString().padStart(2, '0');
        const mins = Math.floor((item['time'] % 3600) / 60).toString().padStart(2, '0');
        const secs = (item['time'] % 60).toString().padStart(2, '0');

        let text = `
        <div id="${item['id']}" class="test" data-time="${item['time']}">
            <div class="name test2">
                ${item['name']}
            </div>
            <div class="test2">
                <div class="hh item">${hours}</div>
                <div class="aa">:</div>
                <div class="mm item">${mins}</div>
                <div class="aa">:</div>
                <div class="ss item">${secs}</div>
            </div>
            <div class="test2">
                <button class="bt" onclick="startTimer('${item['id']}')">Старт</button>
                <button class="bt" onclick="pauseTimer('${item['id']}')">Стоп</button>
                <button class="bt" onclick="openWindow('delete', ${item['id']}, '${item['name']}')">Удалить</button>
            </div>
        </div>
        `
        main_box.innerHTML += text;
    });
}

init();