const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

export interface DeepgramConfig {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

export function createDeepgramSocket(config: DeepgramConfig): {
  socket: WebSocket;
  sendAudio: (data: Blob | ArrayBuffer) => void;
  close: () => void;
} {
  // SIMPLIFIED DEEPGRAM PARAMETERS - only essentials to avoid connection errors
  const params = new URLSearchParams({
    model: 'nova-2',
    language: 'id',
    smart_format: 'true',
    punctuate: 'true',
    interim_results: 'true',
  });

  const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`;


  const socket = new WebSocket(url, ["token", DEEPGRAM_API_KEY]);

  socket.onopen = () => {
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Log for debugging
      if (data.type === 'Results') {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final;

        if (transcript && transcript.trim() !== "") {
          config.onTranscript(transcript, isFinal);
        }
      }
    } catch (err) {
    }
  };

  socket.onerror = (error) => {
    config.onError?.(error);
  };

  socket.onclose = (event) => {
    const wasClean = event.wasClean;
    const code = event.code;
    
    if (wasClean) {
    } else {
      
      // Notify about unexpected closure
      if (code !== 1000 && code !== 1001) { // 1000 = normal, 1001 = going away
        config.onError?.(new Event('Connection lost'));
      }
    }
    
    config.onClose?.();
  };

  const sendAudio = (data: Blob | ArrayBuffer) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    } else {
    }
  };

  const close = () => {
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }
  };

  return { socket, sendAudio, close };
}

// Filler word detection utility for Indonesian
const FILLER_WORDS = [
  "ee",
  "eee",
  "em",
  "emm",
  "emmm",
  "anu",
  "kayak",
  "terus",
  "jadi",
  "apa tuh",
  "eh",
  "hmm",
  "hmmm",
];

export function countFillerWords(transcript: string): {
  total: number;
  breakdown: Record<string, number>;
} {
  const lower = transcript.toLowerCase();
  const breakdown: Record<string, number> = {};
  let total = 0;

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) {
      breakdown[filler] = matches.length;
      total += matches.length;
    }
  }

  return { total, breakdown };
}

// Pause/hesitation detection (counts silences > 3 seconds)
export function countLongPauses(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  let pauses = 0;
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] - timestamps[i - 1] > 3000) {
      pauses++;
    }
  }
  return pauses;
}
