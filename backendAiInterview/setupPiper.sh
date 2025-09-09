#!/bin/bash
set -e

echo "Downloading Piper..."
wget -q https://github.com/rhasspy/piper/releases/latest/download/piper_linux_x86_64.tar.gz -O piper.tar.gz

echo "Extracting Piper..."
tar -xzf piper.tar.gz
rm piper.tar.gz

cd piper

echo "Downloading en_US-lessac-medium model..."
wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

echo "Piper and en_US-lessac-medium model are ready."
echo "Run example:"
echo "./piper --model en_US-lessac-medium.onnx --output_file out.wav <<< 'Hello, this is Piper speaking.'"
