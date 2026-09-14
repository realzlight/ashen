(function () {
  var BACKEND_URL = 'https://ashen-9949.onrender.com';

  var scriptTag = document.currentScript;
  var widgetKey = scriptTag && scriptTag.getAttribute('data-key');
  if (!widgetKey) {
    console.error('Ashen widget: missing data-key attribute');
    return;
  }

  var host = document.createElement('div');
  host.id = 'ashen-widget-root';
  host.style.setProperty('--ashen-color', '#E8491C');
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: 'open' });

  var state = { open: false, history: [], streaming: false };

  var style = document.createElement('style');
  style.textContent =
    '*{box-sizing:border-box;}' +
    ':host{all:initial;}' +
    '.ashen-launcher{position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:var(--ashen-color,#E8491C);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.25);z-index:999999;transition:transform .15s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}' +
    '.ashen-launcher:hover{transform:scale(1.05);}' +
    '.ashen-launcher svg{width:24px;height:24px;fill:#fff;}' +
    '.ashen-window{position:fixed;bottom:84px;right:20px;width:340px;max-width:calc(100vw - 40px);height:460px;max-height:calc(100vh - 120px);background:#0B0B0A;border:1px solid #2A2724;border-radius:14px;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;z-index:999999;box-shadow:0 12px 40px rgba(0,0,0,0.4);}' +
    '.ashen-window.open{display:flex;}' +
    '.ashen-header{display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid #2A2724;color:#EDEAE4;font-size:13px;font-weight:600;}' +
    '.ashen-dot{width:6px;height:6px;border-radius:50%;background:var(--ashen-color,#E8491C);}' +
    '.ashen-close{margin-left:auto;cursor:pointer;color:#8F8A82;font-size:16px;line-height:1;}' +
    '.ashen-close:hover{color:#EDEAE4;}' +
    '.ashen-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}' +
    '.ashen-msg{font-size:13px;line-height:1.5;padding:8px 11px;border-radius:8px;max-width:82%;white-space:pre-wrap;word-wrap:break-word;}' +
    '.ashen-msg-bot{align-self:flex-start;background:#141311;border:1px solid #2A2724;color:#EDEAE4;}' +
    '.ashen-msg-user{align-self:flex-end;background:var(--ashen-color,#E8491C);color:#fff;}' +
    '.ashen-typing{align-self:flex-start;display:flex;gap:4px;padding:10px 12px;background:#141311;border:1px solid #2A2724;border-radius:8px;}' +
    '.ashen-typing span{width:5px;height:5px;border-radius:50%;background:#8F8A82;animation:ashen-bounce 1.2s infinite ease-in-out;}' +
    '.ashen-typing span:nth-child(2){animation-delay:.15s;}' +
    '.ashen-typing span:nth-child(3){animation-delay:.3s;}' +
    '@keyframes ashen-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-4px);opacity:1;}}' +
    '.ashen-cursor{display:inline-block;width:2px;height:12px;background:#EDEAE4;margin-left:2px;vertical-align:text-bottom;animation:ashen-blink .9s step-end infinite;}' +
    '@keyframes ashen-blink{50%{opacity:0;}}' +
    '.ashen-input-row{display:flex;gap:8px;padding:12px;border-top:1px solid #2A2724;}' +
    '.ashen-input{flex:1;background:#141311;border:1px solid #2A2724;border-radius:8px;padding:8px 10px;font-size:13px;color:#EDEAE4;outline:none;font-family:inherit;}' +
    '.ashen-input::placeholder{color:#8F8A82;}' +
    '.ashen-send{background:var(--ashen-color,#E8491C);border:none;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}' +
    '.ashen-send svg{width:14px;height:14px;fill:#fff;}' +
    '.ashen-send:disabled{opacity:.5;cursor:not-allowed;}';
  shadow.appendChild(style);

  var wrapper = document.createElement('div');
  wrapper.innerHTML =
    '<div class="ashen-launcher"><svg viewBox="0 0 24 24"><path d="M4 4h16v12H7l-3 3V4z"/></svg></div>' +
    '<div class="ashen-window">' +
    '  <div class="ashen-header"><span class="ashen-dot"></span><span class="ashen-title">Support</span><span class="ashen-close">&times;</span></div>' +
    '  <div class="ashen-body"></div>' +
    '  <div class="ashen-input-row">' +
    '    <input class="ashen-input" placeholder="Ask a question…" />' +
    '    <button class="ashen-send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>' +
    '  </div>' +
    '</div>';
  shadow.appendChild(wrapper);

  var launcher = shadow.querySelector('.ashen-launcher');
  var win = shadow.querySelector('.ashen-window');
  var closeBtn = shadow.querySelector('.ashen-close');
  var body = shadow.querySelector('.ashen-body');
  var input = shadow.querySelector('.ashen-input');
  var sendBtn = shadow.querySelector('.ashen-send');
  var titleEl = shadow.querySelector('.ashen-title');

  function toggle(open) {
    state.open = open;
    win.classList.toggle('open', open);
  }
  launcher.addEventListener('click', function () { toggle(!state.open); });
  closeBtn.addEventListener('click', function () { toggle(false); });

  function addMessage(role, text) {
    var div = document.createElement('div');
    div.className = 'ashen-msg ' + (role === 'user' ? 'ashen-msg-user' : 'ashen-msg-bot');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'ashen-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  fetch(BACKEND_URL + '/api/chat/config?widgetKey=' + encodeURIComponent(widgetKey))
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.themeColor) host.style.setProperty('--ashen-color', data.themeColor);
      if (data.name) titleEl.textContent = data.name;
    })
    .catch(function () { /* fall back to defaults silently */ });

  async function sendMessage() {
    var text = input.value.trim();
    if (!text || state.streaming) return;

    addMessage('user', text);
    state.history.push({ role: 'user', text: text });
    input.value = '';
    sendBtn.disabled = true;
    state.streaming = true;

    var typingEl = showTyping();

    try {
      var res = await fetch(BACKEND_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetKey: widgetKey,
          message: text,
          history: state.history.slice(0, -1),
        }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      typingEl.remove();
      var botDiv = addMessage('bot', '');
      var cursor = document.createElement('span');
      cursor.className = 'ashen-cursor';
      botDiv.appendChild(cursor);

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var fullText = '';

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });

        var lines = buffer.split('\n');
        buffer = lines.pop();

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf('data: ') !== 0) continue;
          var jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            var parsed = JSON.parse(jsonStr);
            if (parsed.text) {
              fullText += parsed.text;
              botDiv.textContent = fullText;
              botDiv.appendChild(cursor);
              body.scrollTop = body.scrollHeight;
            }
          } catch (e) {}
        }
      }

      cursor.remove();
      state.history.push({ role: 'model', text: fullText });
    } catch (err) {
      typingEl.remove();
      addMessage('bot', 'Something went wrong. Please try again.');
    } finally {
      state.streaming = false;
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
})();
