from flask import Flask, request, jsonify
import os
import speech_recognition as sr

app = Flask(__name__)

# Path to the folder with ASL images' names, each corresponding to a word or letter
ASL_IMAGES_PATH = "/home/semicile/TULA/i_Hear/assets"

# Function to convert audio to text
def convert_audio_to_text(audio_file):
    recognizer = sr.Recognizer()
    audio = sr.AudioFile(audio_file)
    
    with audio as source:
        audio_data = recognizer.record(source)
    
    try:
        # Convert speech to text
        text = recognizer.recognize_google(audio_data)
        return text.lower()  # Return in lowercase for easier mapping
    except sr.UnknownValueError:
        return None  # Handle case when speech is not recognized

# Route to handle file uploads and return ASL image names
@app.route('/audio-to-asl', methods=['POST'])
def audio_to_asl():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    # Convert audio to text
    text = convert_audio_to_text(audio_file)
    
    if text is None:
        return jsonify({"error": "Could not recognize speech"}), 400
    
    # Split the text into individual words
    words = text.split()
    
    asl_image_names = []
    
    # Collect all corresponding ASL image names for each word
    for word in words:
        asl_image_file = os.path.join(ASL_IMAGES_PATH, f"{word}.png")
        if os.path.exists(asl_image_file):
            asl_image_names.append(f"{word}.png")
        else:
            # Handle case where ASL image for a word is not found
            return jsonify({"error": f"No ASL image found for the word: {word}"}), 404
    
    # Return the list of image names
    return jsonify({"text": text, "asl_image_names": asl_image_names}), 200

if __name__ == '__main__':
    app.run(debug=True)
