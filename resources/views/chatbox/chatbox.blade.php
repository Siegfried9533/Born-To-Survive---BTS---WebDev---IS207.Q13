<!-- Chatbox Icon -->
<style>
#chatbox-icon {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 56px;
    height: 56px;
    background: #007bff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1000;
}
#chatbox-icon svg {
    fill: #fff;
    width: 32px;
    height: 32px;
}
#chatbox-window {
    position: fixed;
    bottom: 100px;
    right: 32px;
    width: 350px;
    max-width: 90vw;
    height: 450px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    display: none;
    flex-direction: column;
    z-index: 1001;
}
#chatbox-header {
    background: #007bff;
    color: #fff;
    padding: 12px;
    border-radius: 12px 12px 0 0;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
#chatbox-close {
    cursor: pointer;
    font-size: 20px;
}
#chatbox-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
}
#chatbox-footer {
    padding: 12px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 8px;
}
#chatbox-input {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 6px 10px;
}
#chatbox-send {
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 6px 16px;
    cursor: pointer;
}

.ai-recommendation {
    font-size: 0.85rem;
    color: #155724;
    background-color: #d4edda;
    border-radius: 4px;
    padding: 8px;
    margin-top: 5px;
}
</style>

<div id="chatbox-icon" onclick="toggleChatbox()">
    <svg viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.08 1.06 3.97 2.83 5.39L4 21l4.06-2.17C9.36 18.94 10.66 19 12 19c5.52 0 10-3.58 10-8s-4.48-8-10-8zm0 14c-1.1 0-2.17-.09-3.17-.26l-.6-.11-.43.23-2.13 1.14.38-2.23.09-.51-.39-.39C4.07 13.14 3 11.14 3 9c0-3.31 3.58-6 8-6s8 2.69 8 6-3.58 6-8 6z"/></svg>
</div>

<div id="chatbox-window">
    <div id="chatbox-header">
        Chatbox
        <span id="chatbox-close" onclick="toggleChatbox()">&times;</span>
    </div>
    <div id="chatbox-body">
        <!-- Nội dung chat sẽ hiển thị ở đây -->
    </div>
    <div id="chatbox-footer">
        <input id="chatbox-input" type="text" placeholder="Nhập tin nhắn..." />
        <button id="chatbox-send" onclick="sendChatMessage()">Gửi</button>
    </div>
</div>

@vite('resources/js/chatbox.js')