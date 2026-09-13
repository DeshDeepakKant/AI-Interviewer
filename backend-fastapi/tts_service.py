import edge_tts
import asyncio
import re

def clean_text_for_speech(text: str) -> str:
    """Removes markdown formatting, symbols, and code blocks for crisp speech playback."""
    # Replace code blocks with concise spoken indicator
    text = re.sub(r'```[\s\S]*?```', 'code snippet', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    # Remove markdown formatting characters: *, _, #, ~, >, bullet points
    text = re.sub(r'[*_#~>]', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Collapse excess whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

async def generate_speech_audio(text: str, voice: str = "en-US-ChristopherNeural") -> bytes:
    """Synthesizes text into high-fidelity MP3 audio bytes using neural Edge TTS."""
    if not text or not text.strip():
        return b""
    clean_text = clean_text_for_speech(text)
    try:
        communicate = edge_tts.Communicate(clean_text, voice)
        audio_buffer = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer += chunk["data"]
        return audio_buffer
    except Exception as e:
        print(f"[TTS Service] Audio generation failed: {e}")
        return b""
