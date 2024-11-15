import { useState } from 'react';
import { OpenAI } from 'openai'; 
import './App.css'

 // Open AI key
 const openAIKey = (import.meta.env.VITE_REACT_OPEN_AI_KEY)

 // Provided Data
 const data = [
   {
   "image_id": "001",
   "timestamp": "2024-09-24 14:31:05",
   "latitude": "44.4280° N",
   "longitude": "110.5885° W",
   "altitude_m": 50,
   "heading_deg": 270,
   "file_name": "YNP_001.jpg",
   "camera_tilt_deg": -15,
   "focal_length_mm": 24,
   "iso": 100,
   "shutter_speed": "1/500",
   "aperture": "f/2.8",
   "color_temp_k": 5600,
   "image_format": "RAW+JPEG",
   "file_size_mb": 25.4,
   "drone_speed_mps": 5.2,
   "battery_level_pct": 98,
   "gps_accuracy_m": 0.5,
   "gimbal_mode": "Follow",
   "subject_detection": "Yes",
   "image_tags": ["Geyser", "Steam"]
   },
   {
   "image_id": "002",
   "timestamp": "2024-09-24 14:33:22",
   "latitude": "44.4279° N",
   "longitude": "110.5890° W",
   "altitude_m": 75,
   "heading_deg": 180,
   "file_name": "YNP_002.jpg",
   "camera_tilt_deg": -30,
   "focal_length_mm": 35,
   "iso": 200,
   "shutter_speed": "1/1000",
   "aperture": "f/4",
   "color_temp_k": 5200,
   
   "image_format": "RAW+JPEG",
   "file_size_mb": 27.1,
   "drone_speed_mps": 3.8,
   "battery_level_pct": 95,
   "gps_accuracy_m": 0.6,
   "gimbal_mode": "Free",
   "subject_detection": "No",
   "image_tags": ["Forest", "River"]
   },
   {
   "image_id": "003",
   "timestamp": "2024-09-24 14:36:47",
   "latitude": "44.4275° N",
   "longitude": "110.5888° W",
   "altitude_m": 100,
   "heading_deg": 90,
   "file_name": "YNP_003.jpg",
   "camera_tilt_deg": 0,
   "focal_length_mm": 50,
   "iso": 400,
   "shutter_speed": "1/2000",
   "aperture": "f/5.6",
   "color_temp_k": 5800,
   "image_format": "RAW+JPEG",
   "file_size_mb": 26.8,
   "drone_speed_mps": 2.5,
   "battery_level_pct": 91,
   "gps_accuracy_m": 0.4,
   "gimbal_mode": "Tripod",
   "subject_detection": "Yes",
   "image_tags": ["Wildlife", "Elk"]
   },
   {
   "image_id": "004",
   "timestamp": "2024-09-24 14:40:13",
   "latitude": "44.4277° N",
   "longitude": "110.5882° W",
   "altitude_m": 120,
   "heading_deg": 0,
   "file_name": "YNP_004.jpg",
   "camera_tilt_deg": -45,
   "focal_length_mm": 70,
   "iso": 800,
   "shutter_speed": "1/4000",
   
   "aperture": "f/8",
   "color_temp_k": 6000,
   "image_format": "RAW+JPEG",
   "file_size_mb": 28.3,
   "drone_speed_mps": 1.2,
   "battery_level_pct": 87,
   "gps_accuracy_m": 0.7,
   "gimbal_mode": "Follow",
   "subject_detection": "No",
   "image_tags": ["Canyon", "Waterfall"]
   },
   {
   "image_id": "005",
   "timestamp": "2024-09-24 14:44:56",
   "latitude": "44.4282° N",
   "longitude": "110.5879° W",
   "altitude_m": 80,
   "heading_deg": 315,
   "file_name": "YNP_005.jpg",
   "camera_tilt_deg": -10,
   "focal_length_mm": 24,
   "iso": 100,
   "shutter_speed": "1/250",
   "aperture": "f/2.8",
   "color_temp_k": 5400,
   "image_format": "RAW+JPEG",
   "file_size_mb": 24.9,
   "drone_speed_mps": 6.7,
   "battery_level_pct": 82,
   "gps_accuracy_m": 0.5,
   "gimbal_mode": "Free",
   "subject_detection": "Yes",
   "image_tags": ["Thermal Pool", "Bacteria"]
   }
   ]
 
// Incorporating OpenAI 
const openai = new OpenAI({
  apiKey: openAIKey,
  dangerouslyAllowBrowser: true,
});

// Fetch Chatbot responses according to Open AI API format
async function fetchChatbotResponse(userQuery, data) {
  const prompt = generatePrompt(userQuery, data);
  const response = await openai.chat.completions.create({
    messages: [
      {role: 'system', content: 'Hello'},
      {role: 'user', content: userQuery}
    ],
    model: 'gpt-3.5-turbo',
    max_tokens: 200,
  });
  return response.choices[0].message.content;
}

// Set the chatbot up
function generatePrompt (userQuery, data) {
  const dataContext = data.map(item => `Image: ${item.image_id}`)
  return `
  You are a chatbot that answers questions using the following data:
  ${dataContext}
  Answer the question based solely on the information in the data. If the answer cannot be found in the data, say "Sorry, I don't have that information."

  Question: ${userQuery}
  `;
}

// Troubleshooting Error 429: Too Many Requests
async function fetchChatbotResponseWithRetry(userQuery, data, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fetchChatbotResponse(userQuery, data);  
    } catch (error) {

      console.error("error during request:", error)
      if (error.response && error.response.status === 429) {
        // If rate limit is hit, wait and retry
        console.log("Rate limit hit, retrying...");
        await delay(1000 * Math.pow(2, attempt)); 
        attempt++;
      } else {
        throw error;  
      }
    }
  }
  throw new Error("Too many requests. Please try again later.");
}

// Using state to manage chat messages and responses

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const handleSendMessage = async () => {
    const userMessage = { role: 'user', content: userInput };
    setMessages([...messages, userMessage]);
  
    try {
      const botResponse = await fetchChatbotResponseWithRetry(userInput, data);
      const botMessage = { role: 'bot', content: botResponse}; 
      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      const errorMessage = {role: 'bot', content: "Sorry, I'm having trouble. Please try again."}
      setMessages([...messages, userMessage, errorMessage])
    }

    setUserInput('');   
  };


  return (
    <>
      <h1>DroneDeploy Chat</h1>
      <div className = 'chatbox'>
        <div>
          {/* Display chat */}
          {messages.map((msg, i) => (
            <div key={i} className={msg.role}>
              <strong>{msg.role === 'user' ? 'You' : 'Bot'}</strong> {msg.content}
            </div>
          ))}
        </div>
        <input  
          type='text'
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder='Ask a question...'
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </>
  )
}

export default App
