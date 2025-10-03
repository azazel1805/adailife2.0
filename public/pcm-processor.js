/**
 * This AudioWorkletProcessor receives raw audio data from the microphone
 * in chunks of 128 frames and posts it back to the main thread.
 */
class PcmProcessor extends AudioWorkletProcessor {
  /**
   * The process method is called for each block of 128 audio frames.
   * @param {Float32Array[][]} inputs - An array of inputs, each with an array of channels.
   * @returns {boolean} - Return true to keep the processor alive.
   */
  process(inputs) {
    // Get the audio data from the first channel of the first input.
    const channelData = inputs[0][0];

    // If there is data, post a copy of it back to the main thread.
    // We send a copy (.slice(0)) to avoid transferring ownership of the buffer,
    // which is important for performance and stability.
    if (channelData) {
      this.port.postMessage(channelData.slice(0));
    }

    // Return true to indicate the processor should not be terminated.
    return true;
  }
}

// Register the processor with the name 'pcm-processor'.
// This name is used in the main application to create the AudioWorkletNode.
registerProcessor('pcm-processor', PcmProcessor);
