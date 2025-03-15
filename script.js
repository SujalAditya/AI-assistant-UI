

// Configuration - Add your API endpoint here
const API_ENDPOINT = 'YOUR_API_ENDPOINT_HERE'; // e.g., 'https://api.example.com/chat'

let isRecording = false;
let recognition = null;

// Theme toggling
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
});

// Auto-resize textarea
const textarea = document.getElementById('user-input');
textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Speech recognition setup
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('user-input').value = transcript;
        toggleVoiceRecording(); 
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        toggleVoiceRecording();
    };
}

// Event listeners
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('voice-button').addEventListener('click', toggleVoiceRecording);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function toggleVoiceRecording() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
    }

    const voiceButton = document.getElementById('voice-button');
    
    if (!isRecording) {
        recognition.start();
        voiceButton.classList.add('recording');
    } else {
        recognition.stop();
        voiceButton.classList.remove('recording');
    }
    
    isRecording = !isRecording;
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (message) {
        // Create user message element
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.innerHTML = `
            <div class="message-content">${message}</div>
        `;
        document.getElementById('chat-messages').appendChild(userMessageDiv);
        
        input.value = '';
        input.style.height = 'auto';
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant-message';
        typingIndicator.innerHTML = `
            <div class="assistant-avatar">AI</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        document.getElementById('chat-messages').appendChild(typingIndicator);

        try {
            // This is where you'll integrate your API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers your API requires
                    // 'Authorization': 'Bearer YOUR_API_KEY',
                },
                body: JSON.stringify({
                    message: message,
                    // Add any additional parameters your API requires
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add assistant's response
            const assistantMessageDiv = document.createElement('div');
            assistantMessageDiv.className = 'message assistant-message';
            assistantMessageDiv.innerHTML = `
                <div class="assistant-avatar">AI</div>
                <div class="message-content">${data.response || data.message || data.text}</div>
            `;
            document.getElementById('chat-messages').appendChild(assistantMessageDiv);

        } catch (error) {
            console.error('Error:', error);
            typingIndicator.remove();
            
            // Add error message
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'message assistant-message';
            errorMessageDiv.innerHTML = `
                <div class="assistant-avatar">AI</div>
                <div class="message-content">Sorry, there was an error processing your request.</div>
            `;
            document.getElementById('chat-messages').appendChild(errorMessageDiv);
        }

        // Scroll to bottom
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
