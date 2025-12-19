// Gán vào window để HTML gọi được từ onclick
window.toggleChatbox = function() {
    const chatbox = document.getElementById('chatbox-window');
    chatbox.style.display = (chatbox.style.display === 'flex') ? 'none' : 'flex';
}
//sử lý sự kiện nút gửi tin nhắn
document.addEventListener('DOMContentLoaded', function() {
    const icon = document.getElementById('chatbox-icon');
    const closeBtn = document.getElementById('chatbox-close');
    const input = document.getElementById('chatbox-input');
    const sendBtn = document.getElementById('chatbox-send');

    
    icon.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Xử lý gửi tin nhắn khi bấm Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendChatMessage();
    });

    sendBtn.addEventListener('click', sendChatMessage);
});

async function sendChatMessage() {
    const input = document.getElementById('chatbox-input');
    const question = input.value.trim();

    if (!question) return;

    const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfTokenElement ? csrfTokenElement.getAttribute('content') : '';

    if (!csrfToken) {
        console.error("Lỗi: Không tìm thấy thẻ meta CSRF-TOKEN. Vui lòng thêm vào layout.");
    }
    //Tự động hiển thị lời chào khi mở chatbox lần đầu
    const chatboxBody = document.getElementById('chatbox-body');
    if (chatboxBody.children.length === 0) {
        appendMessage('bot', 'Chào mừng đến với Modalab Chat! Tôi có thể giúp gì cho bạn hôm nay?');
    }

    // 1. Hiển thị tin nhắn người dùng
    appendMessage('user', question);
    input.value = '';

    // 2. Tạo hiệu ứng chờ
    const tempId = 'bot-' + Date.now();
    appendMessage('bot', '🤖 Đang suy nghĩ...', tempId);

    try {
        const response = await fetch('/api/chat/ask', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
                body: JSON.stringify({ question: question })
        });
        
        const res = await response.json();
        const botDiv = document.getElementById(tempId);

        if (res.status === 'success') {
            // Helper để format Markdown đơn giản (chuyển \n thành <br>)
            const formatText = (text) => text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            botDiv.innerHTML = `
                <div class="ai-answer" style="line-height: 1.5;">${formatText(res.data.answer)}</div>
                <hr style="margin: 10px 0; border: 0; border-top: 1px dashed #ccc;">
            `;
        } else {
            botDiv.textContent = "⚠️ " + (res.message || "AI không thể phản hồi.");
        }
    } catch (error) {
        console.error(error);
        const botDiv = document.getElementById(tempId);
        if (botDiv) botDiv.textContent = "❌ Lỗi kết nối máy chủ.";
    }
}
window.sendChatMessage = sendChatMessage;

function appendMessage(sender, text, id = null) {
    const body = document.getElementById('chatbox-body');
    const msg = document.createElement('div');
    if (id) msg.id = id;
    
    // Style container tin nhắn
    msg.style.margin = '10px 0';
    msg.style.padding = '10px 14px';
    msg.style.borderRadius = '12px';
    msg.style.fontSize = '14px';
    msg.style.maxWidth = '85%';
    msg.style.wordWrap = 'break-word';
    
    if (sender === 'user') {
        msg.style.background = '#007bff';
        msg.style.color = '#fff';
        msg.style.alignSelf = 'flex-end';
        msg.style.marginLeft = 'auto'; // Đẩy về bên phải
    } else {
        msg.style.background = '#f8f9fa';
        msg.style.color = '#333';
        msg.style.border = '1px solid #dee2e6';
        msg.style.alignSelf = 'flex-start';
    }
    
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight; // Cuộn xuống dưới cùng
}
window.appendMessage = appendMessage;

// Lắng nghe phím Enter trong ô input
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chatbox-input');
    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
});