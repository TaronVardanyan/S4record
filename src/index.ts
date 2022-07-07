let stream: null | MediaStream = null;
let audio: null | MediaStream = null;
let mixedStream: null | MediaStream = null;
let recorder: null | MediaRecorder = null;
let stopButton: HTMLButtonElement | null = document.querySelector('.stop-recording');
let startButton: HTMLButtonElement | null = document.querySelector('.start-recording');
let downloadButton: HTMLAnchorElement | null = document.querySelector('.download-video');
let recordedVideo: HTMLVideoElement | null = document.querySelector('.recorded-video');;
let chunks: Blob[] = [];

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

function handleDataAvailable (e: BlobEvent) {
    chunks.push(e.data);
}

function handleStop (e: BlobEvent) {
    const blob = new Blob(chunks, {
        type: 'video/mp4'
    });
    chunks = [];
    if(downloadButton && recordedVideo) {
        const url = URL.createObjectURL(blob);
        downloadButton.href = url;
        downloadButton.download = 'video/mp4';
        recordedVideo.src = url;
        recordedVideo.load();
        recordedVideo.onloadeddata = () => {
            recordedVideo!.play();

            const rc:HTMLDivElement | null = document.querySelector('.recorded-video-wrap');
            if(rc){
                rc.classList.remove('hidden');
                rc.scrollIntoView({ behavior: "smooth" , block: "start" });
            }

            stream?.getTracks().forEach(track => track.stop());
            audio?.getTracks().forEach(track => track.stop());

            console.log("Recording has been prepared");
        }
    }
}

function stopRecording () {
    recorder?.stop();
    if(startButton && stopButton){
       startButton.disabled = false;
       stopButton.disabled = true;
    }
    console.log("Recording has stopped");
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
    stopButton?.addEventListener('click', stopRecording);
});
