let socket = null;
const WS_URL = 'ws://localhost:3000';

function connectWebSocket() {
	socket = new WebSocket(WS_URL);

	socket.onopen = () => console.log('WebSocket connected');
	socket.onclose = () => setTimeout(connectWebSocket, 5000);
}

chrome.runtime.onMessage.addListener((request) => {
	if (request.type === 'mouse_move' && socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(request));
		console.log("sent", request)
	}
});

chrome.commands.onCommand.addListener(function (command) {
	console.log({command})
	if (command === "toggle-tracking") {
		chrome.storage.local.get('isTracking', (data) => {
			const newState = !(data.isTracking || false);

			chrome.storage.local.set({ isTracking: newState }, () => {
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					chrome.tabs.sendMessage(tabs[0].id, {
						type: 'toggleTracking',
						isTracking: newState
					});
				});
			});
		});
	}
});

connectWebSocket();