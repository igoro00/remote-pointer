const WebSocket = require('ws');

class WebSocketRelay {
    constructor(inputPort, targetUrl) {
        this.inputPort = inputPort;
        this.targetUrl = targetUrl;
        this.inputServer = null;
        this.clients = new Set();
    }

    start() {
        // Utworzenie serwera WebSocket, który będzie nasłuchiwał na określonym porcie
        this.inputServer = new WebSocket.Server({ port: this.inputPort });

        this.inputServer.on('connection', (ws) => {
            console.log(`Nowe połączenie na porcie ${this.inputPort}`);

            // Połączenie z docelowym serwerem WebSocket
            const targetSocket = new WebSocket(this.targetUrl);

            // Obsługa połączenia z serwerem docelowym
            targetSocket.on('open', () => {
                console.log(`Połączono z serwerem docelowym: ${this.targetUrl}`);

                // Przekazywanie wiadomości z wejścia na wyjście
                ws.on('message', (message) => {
                    console.log(`Otrzymano wiadomość: ${message}`);
                    
                    try {
                        // Próba wysłania wiadomości do docelowego serwera
                        if (targetSocket.readyState === WebSocket.OPEN) {
                            targetSocket.send(message);
                            console.log('Wiadomość przekazana do docelowego serwera');
                        } else {
                            console.log('Nie można wysłać wiadomości - serwer niedostępny');
                        }
                    } catch (error) {
                        console.error('Błąd podczas wysyłania wiadomości:', error);
                    }
                });

                // Obsługa zamknięcia połączenia wejściowego
                ws.on('close', () => {
                    console.log('Zamknięto połączenie wejściowe');
                    targetSocket.close();
                });
            });

            // Obsługa błędów połączenia z serwerem docelowym
            targetSocket.on('error', (error) => {
                console.error('Błąd połączenia z serwerem docelowym:', error);
                ws.close();
            });

            // Obsługa błędów połączenia wejściowego
            ws.on('error', (error) => {
                console.error('Błąd połączenia wejściowego:', error);
                targetSocket.close();
            });
        });

        console.log(`WebSocket Relay uruchomiony. Nasłuchiwanie na porcie ${this.inputPort}`);
    }
}

// Przykładowe użycie
const relay = new WebSocketRelay(
    3000,  // Port nasłuchiwania
    'ws://172.28.232.83:3000'  // Docelowy adres WebSocket
);

relay.start();