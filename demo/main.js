// Emotion script
const emotionNLP = document.getElementById("emotionnlp");
const emotionPitch = document.getElementById("emotionpitch");

const emotionArray = ["sad","Happy","Angry","Drowsy"];

function myMessage() {
    const randomIndex = Math.floor(Math.random() * emotionArray.length);
    emotionNLP.value = emotionArray[randomIndex];
    const randomIndexs = Math.floor(Math.random() * emotionArray.length);
    emotionPitch.value = emotionArray[randomIndexs]
}
setInterval(myMessage, 5000);

let recognition;
    let mediaRecorder;
    const audioChunks = [];
    const transcriptElement = document.getElementById("transcript");
    // const startRecordingButton = document.getElementById("startRecording");

    if ("webkitSpeechRecognition" in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = "";
        console.log(event.resultIndex)
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        transcriptElement.textContent = transcript;
      };

    

      recognition.start();

  
      const constraints = { audio: true };

      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          mediaRecorder = new MediaRecorder(stream)
;
          mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(audioBlob);
            const audioElement = new Audio(audioURL);
            audioElement.play();

            audioChunks.length = 0; // Clear audioChunks for the next recording
          };
        })
        .catch((error) => {
          console.error("Error accessing the microphone:", error);
        });
    }
    
    function startRecording() {
      if (mediaRecorder && mediaRecorder.state === "inactive") {
        mediaRecorder.start();
      }
    }


    
// https://www.myinstants.com/media/sounds/ylvis-cute.mp3 //
window.it = 0
window.onload = function () {
    // Elements
    var audio = document.getElementById("audio-main");
    var video = document.getElementById("video");
    var canvas = document.getElementById("side");
    var WIDTH = (canvas.width = window.innerWidth);
    var HEIGHT = (canvas.height = window.innerHeight);

    var ctx = canvas.getContext("2d");

    var mouseX = 0;
    var mouseY = 0;
    window.addEventListener("mousemove", function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Local File //
    var fbtn = document.getElementById("file");
    fbtn.addEventListener("click", function () {
        var file = document.createElement("input");
        file.type = "file";
        file.accept = "audio/*";
        file.click();
        file.onchange = function () {
            var files = this.files;

            audio.src = URL.createObjectURL(files[0]);
            audio.load();
            audio.play();
            audio.style.display = "block";
            visualize(0, audio);
        };
    });

    // Desktop Audio //
    var captureBtn = document.getElementById("capture");
    captureBtn.addEventListener("click", async function () {
        var desktopStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        video.src = desktopStream;
        video.muted = true;
        audio.style.display = "none";
        visualize(1, desktopStream);
    });

    // Microphone //
    var cbx = document.getElementById("cbx");
    async function mic() {
        var micStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
        audio.style.display = "none";
        visualize(2, micStream);
        cbx.addEventListener("change", async function () {
            var micMode = cbx.checked;
            if (micMode) {
                audio.style.display = "none";
                visualize(2, micStream);
            }
        });
    }

    mic();

    function visualize(from, source) {
        var context = new AudioContext();
        var select = document.querySelector("select#mode");
        if (0 == from) {
            var src = context.createMediaElementSource(source);
        } else if (1 == from) {
            var src = context.createMediaStreamSource(source);
        } else if (2 == from) {
            var src = context.createMediaStreamSource(source);
        }
        console.log(src);
        var analyser = context.createAnalyser();
        var listen = context.createGain();

        src.connect(listen);
        listen.connect(analyser);
        if (from == 0) {
            analyser.connect(context.destination);
        }
        analyser.fftSize = 2 ** 12;
        var frequencyBins = analyser.fftSize / 2;

        var bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);
        let dataArray = new Uint8Array(bufferLength);
        var dataHistory = [];

        renderFrame();

        function renderFrame() {
            requestAnimationFrame(renderFrame);

            analyser.smoothingTimeConstant = 0.5;

            if (from == 2) {
                if (cbx.checked) {
                    listen.gain.setValueAtTime(1, context.currentTime);
                } else {
                    listen.gain.setValueAtTime(0, context.currentTime);
                }
            } else {
                listen.gain.setValueAtTime(1, context.currentTime);
            }

            var WIDTH = (canvas.width = window.innerWidth);
            var HEIGHT = (canvas.height = window.innerHeight);
            var sliceWidth = WIDTH * 1.0 / bufferLength;

            var x = 0;
            var scale = Math.log(frequencyBins - 1) / WIDTH;

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.lineWidth = 1;
            ctx.strokeStyle = "#fff";
            ctx.beginPath();
            ctx.moveTo(mouseX, 0);
            ctx.lineTo(mouseX, HEIGHT);
            ctx.stroke();
            ctx.closePath();

            let mouseHz = -10 / Math.log((mouseX / WIDTH)) / (Math.log(441000 / 2 - 1) / WIDTH)

           
                analyser.getByteFrequencyData(dataArray);
                let start = 0 //dataArray.find(a=> Math.max.apply('',dataArray));
                analyser.getByteTimeDomainData(dataArray);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#fff";
                ctx.beginPath();
                x = 0;
                for (var i = start; i < bufferLength; i++) {
                    var v = dataArray[i] / 128.0;
                    var y = v * HEIGHT / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }

                    x = i * sliceWidth //frequencyBins/analyser.sampleRate;
                }
                ctx.lineTo(WIDTH, dataArray[0] / 128.0 * HEIGHT / 2);
                ctx.stroke();
           

            ctx.textBaseline = "bottom";
            ctx.textAlign = "left";
            ctx.font = "16px Courier";
            ctx.fillStyle = "white";
            ctx.fillText(mouseHz + " Hz",
                mouseX,
                mouseY
            );
        }
    }
} 
