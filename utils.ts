import LiveAudioStream from "react-native-live-audio-stream";
import { Buffer } from "buffer";


const startStreamingAudio = (options: any, onChunk: (data: string) => void) => {
  LiveAudioStream.init(options);
  LiveAudioStream.on('data', onChunk);
  LiveAudioStream.start();
}

const float32ArrayFromPCMBinaryBuffer = (b64EncodedBuffer: string) => {
  const b64DecodedChunk = Buffer.from(b64EncodedBuffer, 'base64');
  const int16Array = new Int16Array(b64DecodedChunk.buffer);

  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = Math.max(-1, Math.min(1, int16Array[i] / 32768.0))
  }
  return float32Array
}

export { startStreamingAudio, float32ArrayFromPCMBinaryBuffer };
