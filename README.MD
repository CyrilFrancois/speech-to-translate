# SpeechToTranslate | AI Multilingual Showcase

### **Project Vision**
SpeechToTranslate is a high-performance **Speech-to-Speech (S2S)** translation bridge designed for real-time customer service environments. This repository serves as a **Technical Showcase** of a "Cascaded" AI pipeline, demonstrating that high-accuracy, private translation is achievable through localized SOTA models.

---

## Showcase Scope & Experience
This prototype demonstrates a modular, containerized microservices architecture capable of handling the core linguistic challenges of international customer support:

1.  **Acoustic Intelligence:** Leveraging **Faster-Whisper** to achieve near-human transcription accuracy even in low-bandwidth or noisy conditions.
2.  **Linguistic Fluidity:** Implementing **M2M100**, a "Many-to-Many" multilingual model that allows direct translation across 100+ languages without an English-pivot bias.
3.  **Voice-First UX:** A custom frontend utilizing the **Web MediaRecorder API** to capture, process, and display translations with sub-second backend response times.

---

## Project Architecture
The system is orchestrated via Docker to ensure environment parity between development and production.

### **File Structure Description**
* **`.env`**: Centralized configuration for model selection (Whisper-base/large), hardware device selection (CPU/CUDA), and environment-specific endpoints.
* **`docker-compose.yml`**: Manages the multi-container network, linking the Nginx Presentation Layer to the FastAPI AI Engine.
* **`/backend`**:
    * `main.py`: The FastAPI core logic. Orchestrates audio file ingestion, automatic language detection, and neural translation.
    * `requirements.txt`: Optimized dependencies focusing on CTranslate2 for high-speed inference.
    * `Dockerfile`: A specialized Debian-slim build containing **FFmpeg** and pre-cached neural weights to eliminate "cold-start" delays.
* **`/frontend`**:
    * `index.html`: A professional "Glassmorphism" interface built with Tailwind CSS.
    * `script.js`: Handles asynchronous binary audio blobs and dynamic UI state management (loaders/results).

---

## The 3-Week PoC Roadmap
Moving from this "Batch" showcase to a fully "Streaming" oral discussion:

### **Week 1: Streaming & VAD Integration**
* **Goal:** Achieving a "Live" conversational feel.
* **Technical Shift:** Transition from REST to **WebSockets**. Integrate **Silero VAD** (Voice Activity Detection) to process audio chunks while the user is still speaking.

### **Week 2: Emotional TTS & Voice Synthesis**
* **Goal:** Natural, empathetic human interaction.
* **Technical Shift:** Integration of **Cartesia.ai** or **ElevenLabs** for ultra-low latency (<200ms) Text-to-Speech. Using **SSML** to match the translation's tone to the customer's sentiment.

### **Week 3: Contextual RAG & CRM Integration**
* **Goal:** Specialized business intelligence.
* **Technical Shift:** Connecting the pipeline to a **Vector Database (RAG)**. This allows the AI to correctly translate company-specific product names and technical jargon from the client's internal documentation.

---

## 🎯 Future Production Waypoints (3-Month Phase)
To scale this PoC into a global telephony solution, we will address these enterprise requirements:

| Phase | Focus | Business Value |
| :--- | :--- | :--- |
| **SIP Integration** | RTP Stream Interception | "Plug-in" to existing phone services without changing hardware. |
| **Edge Compute** | GPU Acceleration | Scalability for 1,000+ concurrent calls with <500ms latency. |
| **Compliance** | PII Redaction | Real-time masking of sensitive data (Credit Cards, Names) in the audio stream. |

---

## 🚦 Getting Started
1.  **Environment Setup:** Ensure your `.env` is configured for your local hardware (CPU/GPU).
2.  **Deployment:** ```bash
    docker-compose up --build
    ```
3.  **Demonstration:** Access the local dashboard at `http://localhost`.