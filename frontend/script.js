let mediaRecorder;
let audioChunks = [];
let lastTranslation = ""; // Store for replay

const recordBtn = document.getElementById('recordBtn');
const recordText = document.getElementById('recordText');
const loader = document.getElementById('loader');
const transcriptionOutput = document.getElementById('transcriptionOutput');
const translationOutput = document.getElementById('translationOutput');
const targetLangSelect = document.getElementById('targetLang');
const audioFileInput = document.getElementById('audioFile');

// TTS Specific Elements
const playBtn = document.getElementById('playBtn');
const ttsStatus = document.getElementById('ttsStatus');
const speakingIndicator = document.getElementById('speakingIndicator');
const ttsContainer = document.getElementById('ttsContainer');

// 1. Handle Voice Recording
recordBtn.onclick = async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        recordText.innerText = "Processing...";
        recordBtn.classList.remove('recording');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            await processTranslation(audioBlob);
        };

        mediaRecorder.start();
        recordText.innerText = "Stop Recording";
        recordBtn.classList.add('recording');
    } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Please allow microphone access.");
    }
};

// 2. Handle File Upload
audioFileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) await processTranslation(file);
};

// 3. Central Translation Function
async function processTranslation(audioData) {
    loader.classList.remove('hidden');
    playBtn.disabled = true; // Disable play button while loading
    
    const formData = new FormData();
    formData.append('file', audioData, 'input_audio.wav');
    formData.append('target_lang', targetLangSelect.value);

    try {
        const response = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Backend Error");

        const result = await response.json();
        
        transcriptionOutput.innerText = result.transcription || "No speech detected.";
        translationOutput.innerText = result.translation || "Translation failed.";
        
        // Store and Trigger TTS
        if (result.translation) {
            lastTranslation = result.translation;
            playBtn.disabled = false;
            ttsStatus.innerText = "Translation ready to play";
            speakText(lastTranslation, targetLangSelect.value); // Auto-play
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        translationOutput.innerText = "Error: Could not connect to backend.";
    } finally {
        loader.classList.add('hidden');
        recordText.innerText = "Start Recording";
    }
}

// 4. Text-to-Speech (TTS) Logic
function speakText(text, langCode) {
    if (!text) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map ISO codes to BCP 47 tags
    const langMap = {
        'fr': 'fr-FR',
        'en': 'en-US',
        'es': 'es-ES',
        'de': 'de-DE'
    };
    
    utterance.lang = langMap[langCode] || 'en-US';
    utterance.rate = 0.95; // Slightly slower for better clarity

    // UI Feedback Start
    utterance.onstart = () => {
        ttsStatus.innerText = "Playing audio...";
        speakingIndicator.classList.remove('hidden');
        ttsContainer.classList.add('speaking-active');
    };

    // UI Feedback End
    utterance.onend = () => {
        ttsStatus.innerText = "Playback finished";
        speakingIndicator.classList.add('hidden');
        ttsContainer.classList.remove('speaking-active');
    };

    window.speechSynthesis.speak(utterance);
}

// 5. Playback Button Event
playBtn.onclick = () => {
    speakText(lastTranslation, targetLangSelect.value);
};