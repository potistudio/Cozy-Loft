const audio = document.getElementById("audio1");
const playPauseButton = document.getElementById("playPauseButton");

const glowCanvas = document.getElementById ("glowCanvas")
const glowCanvasContext = glowCanvas.getContext ("2d");

const customCursor = document.getElementById ("customCursor");

const SIRI_WIDTH = 640;
const SIRI_HEIGHT = 320;
const SIRI_SPEED = 0.04;
const SIRI_AMPLITUDE = 0.5;
const AUDIO_VOLUME = 1.0;

let siriWave = null;
let dustCanvas = null;

let isPlaying = false;
let siriAmplitude = 0.0;

let props = {
	amp: 0.0,
	volume: 0.0,
	opacity: 0.0,
};

(function init() {
	initializeCustomCursor();
	initializeSiri();
	initializeDust();

	update();
})();

function update() {
	requestAnimationFrame (update);

	if (siriWave) {
		updateSiriGlow();

		siriWave.amplitude = siriAmplitude;
	} else {
		console.warn ("SiriWave not initialized");
	}
}

function initializeCustomCursor() {
	const customCursor = document.getElementById ("customCursor");
	const playingCursor = customCursor.children[0];
	const pausingCursor = customCursor.children[1];

	document.body.addEventListener ("mousemove", (e) => {
		const x = e.clientX;
		const y = e.clientY;

		customCursor.style.opacity = 1.0;
		anime.animate (customCursor, {
			opacity: { to: 0.0, duration: 2000, easing: 'easeInOutCubic' },
			delay: 2000,
		});

		customCursor.style.transform = `translate(${x}px, ${y}px)`;
	});

	document.body.addEventListener ("mouseenter", e => {
		customCursor.style.visibility = "visible";
	});

	document.body.addEventListener ("mouseleave", e => {
		customCursor.style.visibility = "hidden";
	});

	document.body.addEventListener ("mousedown", e => {
		togglePlayPause();

		customCursor.style.opacity = 1.0;
		anime.animate (customCursor, {
			opacity: { to: 0.0, duration: 2000, easing: 'easeInOutCubic' },
			delay: 2000,
		});

		playingCursor.style.display = isPlaying ? "none" : "block";
		pausingCursor.style.display = isPlaying ? "block" : "none";
	});
}

function initializeSiri() {
	let refreshRate = 60;
	let siriSpeed = SIRI_SPEED;

	getRefreshRate().then (rate => {
		refreshRate = rate;
		siriSpeed *= 60 / refreshRate;

		console.log (`Display refresh rate: approximately ${refreshRate}Hz`);
		console.log (`Optimize Siri speed to ${siriSpeed} (default: ${SIRI_SPEED})`);
	});

	try {
		siriWave = new SiriWave ({
			container: document.getElementById ("siri-container"),
			style: "ios9",
			speed: siriSpeed,
			width: SIRI_WIDTH,
			height: SIRI_HEIGHT,
		});
	} catch (e) {
		console.error ("SiriWave initialization failed:", e);
	}
}

function initializeDust() {
	particlesJS ("hoge", {
		"particles": {
			"number": {
				"value": 64,
				"density": { "enable": true, "value_area": 800 },
			},
			"color": { "value": "#f0f0ff" },
			"shape": {
				"type": "circle",
				"stroke": { "width": 0, "color": "#000000" },
				"polygon": { "nb_sides": 5 },
				"image": { "width": 1920, "height": 1080 },
			},
			"opacity": {
				"value": 0.4,
				"random": true,
				"anim": { "enable": false },
			},
			"size": {
				"value": 2,
				"random": true,
				"anim": { "enable": false },
			},
			"line_linked": { "enable": false },
			"move": {
				"enable": true,
				"speed": 2,
				"direction": "top",
				"random": true,
				"straight": false,
				"out_mode": "out",
				"bounce": false,
				"attract": { "enable": false },
			},
		},
		"interactivity": {
			"detect_on": "canvas",
			"events": {
				"onhover": { "enable": false },
				"onclick": { "enable": true, "mode": "push" },
				"resize": true,
			},
			"modes": {
				"grab": {
					"distance": 400,
					"line_linked": { "opacity": 1 }
				},
				"bubble": {
					"distance": 400,
					"size": 40,
					"duration": 2,
					"opacity": 8,
					"speed": 3
				},
				"repulse": { "distance": 200, "duration": 0.4 },
				"push": { "particles_nb": 4 },
				"remove": { "particles_nb": 2 },
			},
		},
		"retina_detect": true,
	});

	dustCanvas = document.getElementById ("hoge");
}

function updateSiriGlow() {
	let isRetina = window.devicePixelRatio > 1;

	glowCanvas.width = SIRI_WIDTH;
	glowCanvas.height = SIRI_HEIGHT;

	glowCanvasContext.clearRect (0, 0, SIRI_WIDTH, SIRI_HEIGHT);
	glowCanvasContext.globalCompositionOperation = "lighter";

	glowCanvasContext.filter = "blur(32px)";
	glowCanvasContext.globalAlpha = 0.75;
	glowCanvasContext.drawImage (siriWave.canvas, 0, 0, SIRI_WIDTH * window.devicePixelRatio, SIRI_HEIGHT * window.devicePixelRatio, 0, 0, SIRI_WIDTH, SIRI_HEIGHT);

	glowCanvasContext.filter = "blur(16px)";
	glowCanvasContext.globalAlpha = 0.5;
	glowCanvasContext.drawImage (siriWave.canvas, 0, 0, SIRI_WIDTH * window.devicePixelRatio, SIRI_HEIGHT * window.devicePixelRatio, 0, 0, SIRI_WIDTH, SIRI_HEIGHT);

	glowCanvasContext.filter = "blur(8px)";
	glowCanvasContext.globalAlpha = 0.25;
	glowCanvasContext.drawImage (siriWave.canvas, 0, 0, SIRI_WIDTH * window.devicePixelRatio, SIRI_HEIGHT * window.devicePixelRatio, 0, 0, SIRI_WIDTH, SIRI_HEIGHT);

	glowCanvasContext.filter = "blur(4px)";
	glowCanvasContext.globalAlpha = 0.25;
	glowCanvasContext.drawImage (siriWave.canvas, 0, 0, SIRI_WIDTH * window.devicePixelRatio, SIRI_HEIGHT * window.devicePixelRatio, 0, 0, SIRI_WIDTH, SIRI_HEIGHT);
}

function togglePlayPause() {
	if (isPlaying)
		pauseAudio();
	else
		playAudio();
}

function playAudio() {
	isPlaying = true;

	anime.animate (props, {
		opacity: { to: 1.0, duration: 1000, easing: 'easeInCubic' },
		onUpdate: () => { dustCanvas.style.opacity = props.opacity; },
	});

	anime.animate (props, {
		amp: { to: SIRI_AMPLITUDE, duration: 1000, easing: 'easeInCubic' },
		onBegin: () => { siriWave.start(); },
		onUpdate: () => { siriAmplitude = props.amp; },
	});

	anime.animate (props, {
		volume: { to: AUDIO_VOLUME, duration: 2000, easing: 'easeInOutCubic' },
		onBegin: () => { audio.play(); },
		onUpdate: () => { audio.volume = props.volume; },
	});
}

function pauseAudio() {
	isPlaying = false;

	anime.animate (props, {
		opacity: { to: 0.0, duration: 1000, easing: 'easeInCubic' },
		onUpdate: () => { dustCanvas.style.opacity = props.opacity; },
	});

	anime.animate (props, {
		amp: { to: 0.0, duration: 1000, easing: 'easeInCubic' },
		onUpdate: () => { console.log (props.amp); siriAmplitude = props.amp; },
		onComplete: () => { siriWave.stop(); },
	});

	anime.animate (props, {
		volume: { to: 0.0, duration: 1000, easing: 'easeInCubic' },
		onComplete: () => { audio.pause(); },
		onUpdate: () => { audio.volume = props.volume; },
	});
}

function fadeWave (to) {
	anime.animate (props, {
		// amp: [
		// 	{ to: 4, ease: 'inOut(3)', duration: 200 },
		// 	{ to: 1, ease: anime.createSpring({ stiffness: 300 }) }
		// ],
		amp: { to: to, duration: 1000, easing: 'easeInCubic' },
		onUpdate: () => { console.log (props.amp); siriAmplitude = props.amp; },
	});
}

function getRefreshRate() {
	return new Promise(resolve => {
		let frames = 0;
		const startTime = performance.now();

		function countFrames(timestamp) {
			frames++;

			// Collect data for about 1 second
			if (timestamp - startTime > 1000) {
				// Calculate approximate refresh rate
				const refreshRate = Math.round(frames * 1000 / (timestamp - startTime));
				resolve(refreshRate);

				return;
			}

			requestAnimationFrame(countFrames);
		}

		requestAnimationFrame(countFrames);
	});
}
