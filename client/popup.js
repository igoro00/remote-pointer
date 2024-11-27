document.addEventListener('DOMContentLoaded', () => {
	chrome.storage.local.get('isTracking', (data) => {
	  const isTracking = data.isTracking || false;
	  const btn = document.getElementById('toggleTracking');
	  btn.textContent = isTracking ? 'Stop Tracking' : 'Start Tracking';
	});
  });
  
  document.getElementById('toggleTracking').addEventListener('click', () => {
	chrome.storage.local.get('isTracking', (data) => {
	  const currentState = data.isTracking || false;
	  const newState = !currentState;
	  
	  chrome.storage.local.set({isTracking: newState}, () => {
		const btn = document.getElementById('toggleTracking');
		btn.textContent = newState ? 'Stop Tracking' : 'Start Tracking';
		
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		  chrome.tabs.sendMessage(tabs[0].id, {
			type: 'toggleTracking', 
			isTracking: newState
		  });
		});
	  });
	});
  });

document.getElementById('selectArea').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'startAreaSelection'});
  });
});