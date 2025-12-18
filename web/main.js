const main_box = document.getElementById('main_content');

function zxc(){
    let text = `
    
    `
    main_box.innerHTML += '<p>Элемент</p>'
}


let timerId;          // ID интервала
let secondsLeft = 60; // Начальное время в секундах (можно изменить)

const display = document.getElementById('1');
const hh = display.querySelector('.hh');
const mm = display.querySelector('.mm');
const ss = display.querySelector('.ss');

const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');



function updateDisplay() {
    const hours = Math.floor(secondsLeft / 3600).toString().padStart(2, '0');
    const mins = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
    const secs = (secondsLeft % 60).toString().padStart(2, '0');
    
    hh.textContent = hours;
    mm.textContent = mins;
    ss.textContent = secs;
    
    if (secondsLeft <= 0) {
        clearInterval(timerId);
        hh.textContent = "00";
        mm.textContent = "00";
        ss.textContent = "00";
        alert("Время вышло!");
    }
}

function startTimer() {
    if (timerId) return; // Уже запущен

    timerId = setInterval(() => {
        secondsLeft--;
        updateDisplay();
    }, 1000);

    updateDisplay();
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
}

function resetTimer() {
    pauseTimer();
    secondsLeft = 60; // Сброс на начальное значение
    updateDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay(); // Инициализация