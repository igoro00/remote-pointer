// Adres serwera WebSocket (zmień na odpowiedni)
const wsUrl = 'ws://172.28.232.83:3000';

// Funkcja generująca losową liczbę między 0 a 100
function getRandomCoordinate() {
    return Math.floor(Math.random() * 101);
}

// Główna funkcja połączenia i wysyłania
function startWebSocketConnection() {
    // Utworzenie nowego WebSocket
    const socket = new WebSocket(wsUrl);

    // Obsługa otwarcia połączenia
    socket.addEventListener('open', (event) => {
        console.log('Połączono z serwerem WebSocket');

        // Interwał wysyłania wiadomości co 100ms
        const intervalId = setInterval(() => {
            // Przygotowanie wiadomości z losowymi współrzędnymi
            const message = JSON.stringify({
                x: getRandomCoordinate(),
                y: getRandomCoordinate()
            });

            // Wysłanie wiadomości
            socket.send(message);
            console.log('Wysłano:', message);
        }, 100);

        // Obsługa zamknięcia połączenia
        socket.addEventListener('close', () => {
            console.log('Rozłączono z serwerem');
            clearInterval(intervalId);
        });
    });

    // Obsługa błędów
    socket.addEventListener('error', (error) => {
        console.error('Błąd WebSocket:', error);
    });
}

// Uruchomienie połączenia
startWebSocketConnection();