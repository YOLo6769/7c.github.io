const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // Import modelu wiadomości

const app = express();
const server = http.createServer(app);

// W Render.com, PORT jest automatycznie ustawiany przez środowisko
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // Pobieramy z Environmental Variables w Render.com

// Ustawienie Socket.IO z CORS dla frontendu
const io = new Server(server, {
  cors: {
    origin: "*", // Zezwala na połączenie z dowolnej domeny (np. Twojego GitHub Pages)
    methods: ["GET", "POST"]
  }
});

// --- POŁĄCZENIE Z BAZĄ DANYCH ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('Połączono z MongoDB Atlas'))
  .catch(err => console.error('Błąd połączenia z bazą danych:', err));


// --- LOGIKA SOCKET.IO ---
io.on('connection', async (socket) => {
  console.log('Nowy użytkownik podłączony:', socket.id);

  try {
    // 1. POBIERANIE HISTORII PRZY NOWYM POŁĄCZENIU
    const history = await Message.find().sort({ timestamp: 1 }).limit(50); 
    socket.emit('history', history); // Wysyłanie historii tylko do tego klienta
  } catch (error) {
    console.error('Błąd ładowania historii:', error);
  }

  // 2. ODBIERANIE WIADOMOŚCI OD KLIENTA
  socket.on('chat message', async (msg) => {
    
    // Zapis do bazy danych
    const newMessage = new Message(msg);
    try {
        await newMessage.save();
    } catch (error) {
        console.error('Błąd zapisu wiadomości:', error);
        return; 
    }
    
    // 3. ROZGŁASZANIE WIADOMOŚCI DO WSZYSTKICH KLIENTÓW
    io.emit('chat message', msg); 
  });

  socket.on('disconnect', () => {
    console.log('Użytkownik rozłączony:', socket.id);
  });
});

// Uruchomienie serwera
server.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na porcie ${PORT}`);
});