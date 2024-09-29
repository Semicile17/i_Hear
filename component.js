import React, { useState, useEffect } from 'react';

const ASLRecorder = () => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [aslImageNames, setAslImageNames] = useState([]);
    const [text, setText] = useState('');

    // Request microphone access
    useEffect(() => {
        if (recording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);

                    recorder.ondataavailable = (event) => {
                        setAudioBlob(event.data);
                    };

                    recorder.start();
                })
                .catch(error => {
                    console.error('Error accessing microphone:', error);
                });
        } else if (mediaRecorder) {
            mediaRecorder.stop();
        }
    }, [recording]);

    const handleRecordingToggle = () => {
        setRecording(!recording);
    };

    const handleUpload = async () => {
        if (!audioBlob) {
            alert('No audio recorded.');
            return;
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recordedAudio.wav');

        try {
            const response = await fetch('http://127.0.0.1:5000/audio-to-asl', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setAslImageNames(data.asl_image_names);
            setText(data.text); // Store the recognized text if needed
        } catch (error) {
            console.error('Error fetching ASL images:', error);
        }
    };

    // Handle media recorder stopping
    useEffect(() => {
        if (mediaRecorder && !recording && audioBlob) {
            handleUpload(); // Upload audio when recording stops
        }
    }, [recording, mediaRecorder, audioBlob]);

    return (
        <div>
            <h1>ASL Recorder</h1>
            <button onClick={handleRecordingToggle}>
                {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <div className="asl-images">
                {text && <h2>Recognized Text: {text}</h2>}
                {aslImageNames.length > 0 ? (
                    aslImageNames.map((imageName, index) => (
                        <img
                            key={index}
                            src={`/assets/${imageName}`} // Adjust the path based on your structure
                            alt={imageName}
                            style={{ width: '100px', height: 'auto', margin: '10px' }} // Adjust size as needed
                        />
                    ))
                ) : (
                    <p>No images to display.</p>
                )}
            </div>
        </div>
    );
};

export default ASLRecorder;
