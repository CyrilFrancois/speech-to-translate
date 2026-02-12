let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById('recordBtn');
const recordText = document.getElementById('recordText');
const loader = document.getElementById('loader');
const transcriptionOutput = document.getElementById('transcriptionOutput');
const translationOutput = document.getElementById('translationOutput');
const targetLangSelect = document.getElementById('targetLang');
const audioFileInput = document.getElementById('audioFile');

// 1'. Handle Voice Recording
recordBtn.onclick = async () => {
    // Stop recording if active
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

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            await processTranslation(audioBlob);
        };

        mediaRecorder.start();
        recordText.innerText = "Stop Recording";
        recordBtn.classList.add('recording');
    } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Please allow microphone access to use this feature.");
    }
};

// 1''. Handle File Upload
audioFileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        await processTranslation(file);
    }
};

// 2. Central Translation Function
async function processTranslation(audioData) {
    loader.classList.remove('hidden');
    
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
    } catch (error) {
        console.error("Fetch Error:", error);
        translationOutput.innerText = "Error: Could not connect to the backend server.";
    } finally {
        loader.classList.add('hidden');
        recordText.innerText = "Start Recording";
    }
}