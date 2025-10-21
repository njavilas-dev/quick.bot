export const pumpStreamUntilDone = async (
  controller: ReadableStreamDefaultController<Uint8Array>,
  reader: ReadableStreamDefaultReader,
  options = { timeoutMs: 30000, maxChunks: 10000 }
): Promise<void> => {
  const startTime = Date.now()
  let chunkCount = 0

  try {
    while (chunkCount < options.maxChunks) {
      if (Date.now() - startTime > options.timeoutMs) {
        throw new Error('Stream pump timeout')
      }

      const readPromise = reader.read()
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Read timeout')), 5000)
      )
      
      const { done, value } = await Promise.race([readPromise, timeoutPromise])
      
      if (done) return
      
      controller.enqueue(value)
      chunkCount++
    }
    
    throw new Error('Max chunks exceeded')
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // Reader might already be released
    }
  }
}
