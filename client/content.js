(function () {
	let isTracking = false;
	let trackingArea = null;
	let selectionOverlay = null;
	let startX, startY, endX, endY;

	function createSelectionOverlay() {
		selectionOverlay = document.createElement('div');
		selectionOverlay.style.position = 'fixed';
		selectionOverlay.style.border = '2px solid red';
		selectionOverlay.style.backgroundColor = 'rgba(255,0,0,0.2)';
		selectionOverlay.style.zIndex = '9999';
		selectionOverlay.style.resize = 'both';
		selectionOverlay.style.overflow = 'auto';
		document.body.appendChild(selectionOverlay);
	}

	function sendMouseMove(event) {
		if (!isTracking || !trackingArea) return;
	  
		const relativeX = event.clientX - trackingArea.left;
		const relativeY = event.clientY - trackingArea.top;
	  
		// Normalize coordinates to 0-100 range
		const normalizedX = Math.max(0, Math.min(100, (relativeX / trackingArea.width) * 100));
		const normalizedY = Math.max(0, Math.min(100, (relativeY / trackingArea.height) * 100));
		
		chrome.runtime.sendMessage({
		  type: 'mouse_move',
		  x: normalizedX,
		  y: normalizedY,
		  width: trackingArea.width,
		  height: trackingArea.height
		});
	  }

	function startSelection(event) {
		createSelectionOverlay();
		startX = event.clientX;
		startY = event.clientY;

		selectionOverlay.style.left = `${startX}px`;
		selectionOverlay.style.top = `${startY}px`;

		document.addEventListener('mousemove', updateSelection);
		document.addEventListener('mouseup', endSelection);
	}

	function updateSelection(event) {
		endX = event.clientX;
		endY = event.clientY;

		const width = Math.abs(endX - startX);
		const height = Math.abs(endY - startY);

		selectionOverlay.style.width = `${width}px`;
		selectionOverlay.style.height = `${height}px`;
		selectionOverlay.style.left = `${Math.min(startX, endX)}px`;
		selectionOverlay.style.top = `${Math.min(startY, endY)}px`;
	}

	function endSelection() {
		document.removeEventListener('mousemove', updateSelection);
		document.removeEventListener('mouseup', endSelection);
		document.removeEventListener('mousedown', startSelection);

		trackingArea = {
			left: parseInt(selectionOverlay.style.left),
			top: parseInt(selectionOverlay.style.top),
			width: parseInt(selectionOverlay.style.width),
			height: parseInt(selectionOverlay.style.height)
		};

		// Convert current overlay to a persistent, semi-transparent outline
		selectionOverlay.style.border = '2px solid rgba(255,0,0,0.5)';
		selectionOverlay.style.backgroundColor = 'rgba(0,0,0,0)';
		selectionOverlay.style.resize = 'none'; // Disable resizing
		selectionOverlay.style.pointerEvents = 'none'; // Allow interactions through the overlay

		chrome.runtime.sendMessage({ type: 'areaSelectionComplete' });
	}

	chrome.runtime.onMessage.addListener((request) => {
		if (request.type === 'toggleTracking') {
			isTracking = !isTracking;
			if (isTracking) {
				document.addEventListener('mousemove', sendMouseMove);
			} else {
				document.removeEventListener('mousemove', sendMouseMove);
				chrome.runtime.sendMessage({
					type: 'mouse_move',
					x: -100,
					y: -100,
					width: trackingArea.width,
					height: trackingArea.height
				  });
			}
		}

		if (request.type === 'startAreaSelection') {
			// Remove any existing overlay first
			if (selectionOverlay && selectionOverlay.parentNode) {
				document.body.removeChild(selectionOverlay);
			}
			document.addEventListener('mousedown', startSelection);
		}
	});
})();