// Gán vào window để HTML gọi được từ onclick
window.toggleChatbox = function() {
    const chatbox = document.getElementById('chatbox-window');
    chatbox.style.display = (chatbox.style.display === 'flex') ? 'none' : 'flex';
}

async function sendChatMessage() {
    const input = document.getElementById('chatbox-input');
    const body = document.getElementById('chatbox-body');
    const message = input.value.trim();

    if (!message) return;

    // 1. Hiển thị tin nhắn người dùng
    appendMessage('user', message);
    input.value = '';

    // 2. Tạo hiệu ứng chờ
    const tempId = 'bot-' + Date.now();
    appendMessage('bot', '🤖 Đang suy nghĩ...', tempId);

    try {
        const response = await fetch('/api/chat/ask', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') // Bắt buộc cho Laravel
            },
            body: JSON.stringify({ message: message })
        });
        
        const res = await response.json();
        const botDiv = document.getElementById(tempId);

        if (res.status === 'success') {
            // Helper để format Markdown đơn giản (chuyển \n thành <br>)
            const formatText = (text) => text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            botDiv.innerHTML = `
                <div class="ai-answer" style="line-height: 1.5;">${formatText(res.data.answer)}</div>
                <hr style="margin: 10px 0; border: 0; border-top: 1px dashed #ccc;">
                <div class="ai-recommendation" style="font-size: 13px; color: #555;">
                    <span class="badge" style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">GỢI Ý BI</span><br>
                    ${formatText(res.data.recommendation)}
                </div>
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