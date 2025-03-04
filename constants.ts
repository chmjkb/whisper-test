const options = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 1,
  bufferSize: 4096,
};

const transcriptionBufferCapacity = options.bufferSize * 8;

export { options, transcriptionBufferCapacity };
