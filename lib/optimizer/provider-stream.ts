export async function collectProviderStream<TRequest>(
  provider: { generateStream(request: TRequest): AsyncIterable<string> },
  request: TRequest,
  onChunk: (chunk: string) => void
): Promise<string> {
  let accumulated = ''

  for await (const chunk of provider.generateStream(request)) {
    onChunk(chunk)
    accumulated += chunk
  }

  return accumulated
}
