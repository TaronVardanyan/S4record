let stream: null | MediaStream = null;
let audio: null | MediaStream = null;
let mixedStream: null | MediaStream = null;
let recorder: null | MediaRecorder = null;
let stopButton: HTMLButtonElement | null = document.querySelector('.stop-recording');
let startButton: HTMLButtonElement | null = document.querySelector('.start-recording');
let downloadButton: HTMLButtonElement | null = null;
let recordedVideo = null;
let chunks = [];

async function setupStream () {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });

        audio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        setupVideoFeedback();
    } catch(err) {
        console.error(err);
    }
}

function setupVideoFeedback () {
    if(stream) {
        const video:HTMLVideoElement = document.querySelector('.video-feedback')!;
        video.srcObject = stream;
        video.play();
    } else {
        console.warn('no stream available');
    }
}

function handleDataAvailable () {
  // 24:01
}

function handleStop () {
  // 24:01
}

async function startRecording () {
    await setupStream();
    if(stream && audio){
        mixedStream = new MediaStream([
            ...stream.getTracks(),
            ...audio.getTracks()
        ]);
        recorder = new MediaRecorder(mixedStream);
        recorder.ondataavailable = handleDataAvailable;
        recorder.onstop = handleStop;
        recorder.start(200);

        if(startButton && stopButton){
            startButton.disabled = true;
            stopButton.disabled = false;
        }
    } else {
        console.warn('no stream available');
    }
}

window.addEventListener('load', () => {
    startButton?.addEventListener('click', startRecording);
});
