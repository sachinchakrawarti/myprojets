export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to FastAPI backend for voice-to-text conversion
    const backendFormData = new FormData();
    backendFormData.append('audio', audioFile);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/convert`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      throw new Error('Backend processing failed');
    }

    const data = await response.json();
    
    // Return with confidence score
    return new Response(
      JSON.stringify({
        text: data.text || data.transcript || '',
        confidence: data.confidence || 0.95,
        language: data.language || 'en'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process voice' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ status: 'Voice API is ready' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}