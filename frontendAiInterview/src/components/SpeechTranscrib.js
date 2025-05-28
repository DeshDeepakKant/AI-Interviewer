// liveTranscription.js
export function startLiveTranscription(timeout = 10000, onUpdate, onComplete, onError) {
  // Grab the browser's SpeechRecognition API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;

  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const { transcript } = event.results[i][0];
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interim += transcript;
      }
    }
    // send combined text (final + interim) to the UI
    onUpdate?.(finalTranscript + interim);
  };

  recognition.onerror = (evt) => {
    onError?.(evt.error || 'Unknown recognition error');
  };

  recognition.onend = () => {
    // fires when recognition stops (either by timeout or user silence)
    onComplete?.(finalTranscript);
  };

  // start listening, then schedule an automatic stop
  recognition.start();
  setTimeout(() => recognition.stop(), timeout);
  
  // Return the recognition object so it can be stopped manually
  return recognition;
}

// Expose it globally for any legacy usage
window.startLiveTranscription = startLiveTranscription;
