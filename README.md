# ⚡ MegaFile Upload

MegaFile Upload is a fast, lightweight, and secure peer-to-peer (P2P) file transfer web application built with **Node.js**, **Express**, **Socket.io**, and **WebRTC**. 

Files stream directly chunk-by-chunk between devices with zero server storage, keeping transfers end-to-end encrypted and lightning-fast.

---

## ✨ Features

- **Direct P2P Transfer:** Powered by WebRTC DataChannels—no file size limits, zero server storage.
- **Custom Room Codes:** Connect devices across different Wi-Fi networks or mobile data.
- **Real-Time Discovery:** Auto-detects connected peers inside active rooms using Socket.io signaling.
- **Developer HUD:** Live connection status, peer counters, and WebRTC state monitoring.
- **Hidden Easter Eggs:** Interactive Matrix Mode triggers built right into the UI.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- `npm` (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JackTheDemon355/MegaFile-Uploads.git
   cd MegaFile-Uploads
