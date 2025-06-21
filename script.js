// State untuk panel utama
let mainStatus = 'off'; // off, on, running

const mainOnOffBtn = document.getElementById('mainOnOffBtn');
const mainStartBtn = document.getElementById('mainStartBtn');
const mainIndicator = document.getElementById('mainIndicator');
const mainStatusText = document.getElementById('mainStatus');

// State untuk panel bot.v1
let botv1Status = 'stop'; // stop, start

const botv1Btn = document.getElementById('botv1Btn');
const botv1Indicator = document.getElementById('botv1Indicator');
const botv1StatusText = document.getElementById('botv1Status');

function updateMainPanel() {
  mainIndicator.classList.remove('off', 'on', 'running');
  mainOnOffBtn.classList.remove('off', 'on', 'running');
  if (mainStatus === 'off') {
    mainIndicator.classList.add('off');
    mainStatusText.textContent = "MATI";
    mainOnOffBtn.textContent = "OFF";
    mainOnOffBtn.classList.add('off');
    mainStartBtn.disabled = false;
    mainStartBtn.classList.add('start');
  } else if (mainStatus === 'on') {
    mainIndicator.classList.add('on');
    mainStatusText.textContent = "HIDUP";
    mainOnOffBtn.textContent = "ON";
    mainOnOffBtn.classList.add('on');
    mainStartBtn.disabled = false;
    mainStartBtn.classList.add('start');
  } else if (mainStatus === 'running') {
    mainIndicator.classList.add('running');
    mainStatusText.textContent = "RUNNING";
    mainOnOffBtn.textContent = "ON";
    mainOnOffBtn.classList.add('running');
    mainStartBtn.disabled = true;
    mainStartBtn.classList.remove('start');
  }
}

mainOnOffBtn.onclick = function() {
  if (mainStatus === 'off') {
    mainStatus = 'on';
  } else if (mainStatus === 'on' || mainStatus === 'running') {
    mainStatus = 'off';
  }
  updateMainPanel();
};
mainStartBtn.onclick = function() {
  if (mainStatus === 'on') {
    mainStatus = 'running';
  }
  updateMainPanel();
};

// Panel bot.v1
function updateBotv1Panel() {
  botv1Indicator.classList.remove('start', 'stop');
  botv1Btn.classList.remove('start', 'stop');
  if (botv1Status === 'stop') {
    botv1Indicator.classList.add('stop');
    botv1Btn.textContent = "START";
    botv1Btn.classList.add('start');
    botv1StatusText.textContent = "STOP";
  } else {
    botv1Indicator.classList.add('start');
    botv1Btn.textContent = "STOP";
    botv1Btn.classList.add('stop');
    botv1StatusText.textContent = "START";
  }
}
botv1Btn.onclick = function() {
  botv1Status = botv1Status === 'stop' ? 'start' : 'stop';
  updateBotv1Panel();
};

// Inisialisasi UI
updateMainPanel();
updateBotv1Panel();