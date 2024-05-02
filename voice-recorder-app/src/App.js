import React, { useState, useEffect } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder-2';

function App() {
  const [id, setId] = useState('');
  const [message, setMessage] = useState(''); // Here we properly declare 'setMessage' as the setter for 'message'
  const [showPlayer, setShowPlayer] = useState(false);
  const [formVisible, setFormVisible] = useState(true);


  useEffect(() => {
    // Directly define the toggle function inside useEffect
    const togglePlayerVisibility = () => {
      setShowPlayer(show => !show);
    };

    // Attach togglePlayerVisibility function to the window object
    window.togglePlayerVisibility = togglePlayerVisibility;

    // Get URL parameters
    const queryParams = new URLSearchParams(window.location.search);
    // Get userID from URL parameters and use it to set the id state
    const userID = queryParams.get('userID');
    if (userID) {
      setId(userID); // Automatically fill the id state if userID parameter exists
    }

    return () => {
      // Cleanup by removing the function from the window object when the component unmounts
      delete window.togglePlayerVisibility;
    };
  }, []); // Keep the dependency array empty as we don't have any external dependencies here

  // RecordingIndicator component definition
  function RecordingIndicator() {
    const [text, setText] = useState('');
    
    useEffect(() => {
      const dots = ['.\u00A0\u00A0', '..\u00A0', '...', '\u00A0\u00A0\u00A0'];
      let currentStep = 0;

      const interval = setInterval(() => {
        setText(dots[currentStep % dots.length]);
        currentStep++;
      }, 300); // Adjust the timing as necessary

      return () => clearInterval(interval);
    }, []);

    return <span>Audio recording{text}</span>;
  }

  const handleSaveRecording = async (blobUrl) => {
    // Check for blank input
    if (id.trim() === "") {
      alert('ID cannot be blank.');
      return;
    }
    // Basic alphanumeric check
    if (!/^[a-z0-9]+$/i.test(id)) {
      alert('ID should only contain letters and numbers.');
      return;
    }
    // Fetch the actual blob data from the blobUrl
    const blob = await fetch(blobUrl).then((r) => r.blob());

    // Identify the MIME type
    const mimeType = blob.type;
    console.log("MIME type of recording:", mimeType);
  
    // Map MIME type to file extension (you may need to expand this list based on your requirements)
    const mimeToExtension = {
      'audio/webm': '.webm',
      'audio/ogg': '.ogg',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav', // Note: This might not be directly supported by all browsers' recording capabilities
      'audio/x-wav': '.wav',
      'audio/wave': '.wav',
    };
    
    const extension = mimeToExtension[mimeType] || '.audio'; // Fallback to a generic extension if unmapped

    const filename = `recording${extension}`;

    const formData = new FormData();
    formData.append('recording', blob, filename);
    formData.append('id', id);

    // Extract the redirect URL from the current window location
    const queryParams = new URLSearchParams(window.location.search);
    const paramRedirectUrl = queryParams.get('redirectUrl');

    // Specify a default redirect URL
    const defaultUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd6z9d_v6Y4UFu8eFsJ2Y_n4jkd10dNDQmFYBfiEa91A-W7AA/viewform?usp=sf_link"; // You can change this URL to whatever you prefer

    // Function to determine which URL to use
    function determineRedirectUrl() {
      // Check if the redirectUrl is not null and not empty
      if (paramRedirectUrl && paramRedirectUrl.trim() !== "") {
        return paramRedirectUrl;
      } else {
        return defaultUrl;
      }
    }

    // Usage
    const redirectUrl = determineRedirectUrl();

    try {
      const response = await fetch('https://beta.verenigma.com:4000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log(result);
      // Check if the upload was successful
      if (result.success) {
        setFormVisible(false);
        let thankYouMessage = "Thanks for submitting. Your response has been recorded.";
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2500);
      
          // Update message to be a JSX element
          setMessage(
            <span>
              {thankYouMessage} You will shortly be redirected. <a href={redirectUrl} className="font-bold text-blue-600 dark:text-blue-500 hover:underline">Click here</a> if you are not redirected automatically.
            </span>
          );
        } else {
          setMessage(thankYouMessage);
        }
      } else {
        setMessage('File upload failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error encountered during upload.'); // Handle fetch error
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-2 md:p-4">
      {formVisible && (
        <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter your Prolific ID"
            className="w-full p-1.5 md:p-2 border border-gray-300 rounded my-4 text-sm md:text-base text-center"
          />
          <div className='my-4 font-bold text-center text-sm md:text-base'>
            <p>Click "Start Recording", then read the passage below out loud:</p>
          </div>
          <div className="text-center text-xs md:text-sm mb-4 space-y-2">
            <p>You wished to know all about my grandfather. Well, he is nearly ninety-three years old. He dresses himself in an ancient black frock coat, usually minus several buttons; yet he still thinks as swiftly as ever. A long, flowing beard clings to his chin, giving those who observe him a pronounced feeling of the utmost respect. When he speaks his voice is just a bit cracked and quivers a trifle.</p>
            <p>Twice each day he plays skillfully and with zest upon our small organ. Except in the winter when the ooze or snow or ice prevents, he slowly takes a short walk in the open air each day.</p>
            <p>We have often urged him to walk more and smoke less, but he always answers, “Banana Oil!” Grandfather likes to be modern in his language.</p>
          </div>
          <ReactMediaRecorder
            audio
            render={({ status, startRecording, stopRecording, mediaBlobUrl }) => {
              // Handler to start recording and any additional logic
              const handleStartRecording = () => {
                startRecording();
                // Additional logic when recording starts
              };

              // Handler to stop recording and any additional logic
              const handleStopRecording = () => {
                stopRecording();
                // Additional logic when recording stops
              };

              return (
              <>
                {/* Conditionally render status messages based on the recorder's status */}
                {status === "recording" && <p className="text-gray-400 my-4 italic text-sm text-center"><RecordingIndicator /></p>}
                {status === "stopped" && <p className="text-gray-400 my-4 italic text-sm text-center">Recording stopped.</p>}
                <div className="flex justify-center items-center mb-4 flex-col">
                  {status === "recording" ? (
                    <button onClick={handleStopRecording} className="bg-teal-400 text-white px-4 py-2 m-2 rounded shadow hover:bg-teal-500 transition-colors duration-200 ease-in-out">Stop Recording</button>
                  ) : (
                    <button onClick={handleStartRecording} className="bg-teal-400 text-white px-4 py-2 m-2 rounded shadow hover:bg-teal-500 transition-colors duration-200 ease-in-out">
                    {status === "stopped" ? "Restart Recording" : "Start Recording"}
                    </button>
                  )}
                  {/* Conditionally rendering the audio player based on showPlayer state */}
                  {showPlayer && mediaBlobUrl && (
                    <audio src={mediaBlobUrl} controls />
                  )}
                  {mediaBlobUrl && status === "stopped" && (
                    <button onClick={() => handleSaveRecording(mediaBlobUrl)} className="bg-teal-400 text-white px-4 py-2 rounded shadow hover:bg-teal-500 transition-colors duration-200 ease-in-out m-2">
                      Submit
                    </button>
                  )}
                </div>
              </>
              )
            }}
          />

        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;