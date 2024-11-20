<!DOCTYPE html>
<html>
<head>
  <title>AI Detector</title>
  <link rel="stylesheet" href="https://github.com/EpicCodeLearner222/ai-trained-data/blob/main/maincss.css"> <!-- Replace with actual CSS URL -->
  <style>
    #loadingScreen {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(255, 255, 255, 0.9);
      z-index: 1000;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #ccc;
      border-top: 5px solid #333;
      border-radius: 50%;
      animation: spin 1s infinite linear, stretch 0.6s infinite ease-in-out;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes stretch {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }

    #loadingScreen.hidden {
      display: none;
    }

    /* Styling for the updates text area */
    textarea {
      width: 80%;
      max-width: 800px;
      height: 200px;
      padding: 15px;
      font-size: 1.1em;
      border-radius: 10px;
      border: 2px solid #ddd;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: border 0.3s ease, box-shadow 0.3s ease;
      white-space: pre-wrap; /* Ensure updates are displayed correctly */
    }
  </style>
</head>
<body>
  <div id="loadingScreen">
    <div class="spinner"></div>
  </div>
  <h1>AI Detector</h1>
  <input id="inputText" type="text" placeholder="Enter text to analyze">
  <button id="analyzeButton">Analyze</button>
  <button id="refreshButton">Refresh Model</button>
  <button id="updatesButton">Updates</button>
  <div id="result"></div>

  <!-- Textarea for displaying updates -->
  <textarea id="updatesTextArea" placeholder="Updates will be shown here..." rows="10" cols="50"></textarea>

  <script>
    const dataUrl = 'https://raw.githubusercontent.com/EpicCodeLearner222/ai-trained-data/main/aitext.json';
    let humanText = [];
    let aiText = [];
    let humanPhrases = [];
    let updates = [];

    // Function to simulate random delay
    function randomDelay(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Function to fetch the data from the ai-trained-data
    async function fetchData() {
        document.getElementById("loadingScreen").classList.remove("hidden");

        // Wait for a random time before fetching data (1-5 seconds)
        const delayTime = randomDelay(1000, 5000);
        setTimeout(async () => {
            try {
                console.log("Fetching data...");
                const response = await fetch(dataUrl);
                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status}`);
                }
                const data = await response.blob(); // Get data as a Blob to check its size

                const dataSize = data.size;
                const dataSizeKB = (dataSize / 1024).toFixed(2);
                const dataSizeMB = (dataSize / (1024 * 1024)).toFixed(2);
                const dataSizeGB = (dataSize / (1024 * 1024 * 1024)).toFixed(2);
                const dataSizeTB = (dataSize / (1024 * 1024 * 1024 * 1024)).toFixed(2);

                // Log data size in different units
                console.log(`Data fetched successfully. Size: ${dataSize} bytes, ${dataSizeKB} KB, ${dataSizeMB} MB, ${dataSizeGB} GB, ${dataSizeTB} TB`);

                const jsonData = await data.text();
                const parsedData = JSON.parse(jsonData);

                if (parsedData) {
                    // Check if the required data exists before processing
                    if (Array.isArray(parsedData.humanText)) {
                        humanText = parsedData.humanText.map(sentence => sentence.trim().toLowerCase().replace(/[^a-z]/g, ''));
                    }
                    if (Array.isArray(parsedData.aiText)) {
                        aiText = parsedData.aiText.map(sentence => sentence.trim().toLowerCase().replace(/[^a-z]/g, ''));
                    }
                    if (Array.isArray(parsedData.humanPhrases)) {
                        humanPhrases = parsedData.humanPhrases.map(phrase => phrase.trim().toLowerCase().replace(/[^a-z]/g, ''));
                    }

                    console.log("Data processing complete.");
                } else {
                    console.error('Error: Data is undefined or not in expected format.');
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            } finally {
                document.getElementById("loadingScreen").classList.add("hidden");
            }
        }, delayTime);
    }

    // Function to fetch the updates from the GitHub repository
  async function fetchUpdates() {
    document.getElementById("loadingScreen").classList.remove("hidden");
    try {
        console.log("Fetching updates...");
        const response = await fetch('https://raw.githubusercontent.com/EpicCodeLearner222/ai-trained-data/main/updates.json');
        
        if (!response.ok) {
            throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Log updates correctly
        console.log("Updates fetched:", JSON.stringify(jsonData, null, 2)); // Pretty log the entire object

        if (jsonData) {
            let updatesText = "";
            
            // Process updates into a readable string format
            Object.keys(jsonData).forEach(updateKey => {
                const updateArray = jsonData[updateKey];
                updatesText += `${updateKey}:\n`;
                updateArray.forEach(update => {
                    updatesText += `- ${update}\n`;
                });
                updatesText += "\n"; // Add spacing between update groups
            });

            // Check if the textarea exists and then set its value
            const updatesTextArea = document.getElementById("updatesTextArea");
            if (updatesTextArea) {
                updatesTextArea.value = updatesText;
            } else {
                console.error('Textarea with id "updatesTextArea" not found!');
            }
        }
    } catch (error) {
        console.error('Error fetching updates:', error.message);
    } finally {
        document.getElementById("loadingScreen").classList.add("hidden");
    }
}


    // Function to tokenize the input text
    function tokenize(text) {
        return text.split(/\s+/).map(token => token.toLowerCase().replace(/[^a-z]/g, ''));
    }

    // Function to vectorize the tokens (naive approach)
    function vectorize(tokens) {
        const vector = new Array(26).fill(0); // For each letter of the alphabet
        tokens.forEach(token => {
            token.split('').forEach(char => {
                if (char >= 'a' && char <= 'z') {
                    vector[char.charCodeAt(0) - 97] += 1;
                }
            });
        });
        return vector;
    }

    // Function to calculate cosine similarity
    function cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            magnitudeA += vecA[i] * vecA[i];
            magnitudeB += vecB[i] * vecB[i];
        }

        return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    }

    // Function to check the input text
    function checkText() {
        const inputText = document.getElementById("inputText").value.trim().toLowerCase().replace(/[^a-z]/g, '');
        const result = document.getElementById("result");

        if (!inputText) {
            result.textContent = "Please enter some text to analyze.";
            return;
        }

        if (humanText.includes(inputText)) {
            result.textContent = "Likelihood of AI-generated content: 0% (EXACT MATCH)";
            return;
        } else if (aiText.includes(inputText)) {
            result.textContent = "Likelihood of AI-generated content: 100% (EXACT MATCH)";
            return;
        }

        const inputTokens = tokenize(inputText);
        const inputVector = vectorize(inputTokens);

        let maxAiSimilarity = 0;
        let maxHumanSimilarity = 0;
        let humanPhraseSimilarity = 0;

        aiText.forEach(sentence => {
            const sentenceTokens = tokenize(sentence);
            const sentenceVector = vectorize(sentenceTokens);
            const similarity = cosineSimilarity(inputVector, sentenceVector);
            maxAiSimilarity = Math.max(maxAiSimilarity, similarity);
        });

        humanPhrases.forEach(phrase => {
            const phraseTokens = tokenize(phrase);
            const phraseVector = vectorize(phraseTokens);
            const similarity = cosineSimilarity(inputVector, phraseVector);
            humanPhraseSimilarity = Math.max(humanPhraseSimilarity, similarity);
        });

        maxHumanSimilarity = 0;  // Replace this line if you need human text similarity

        let likelihood = 50 + (maxAiSimilarity - humanPhraseSimilarity) * 50;
        likelihood = Math.max(0, Math.min(100, likelihood)); // Clamp between 0 and 100

        result.textContent = `Likelihood of AI-generated content: ${Math.round(likelihood)}%`;
    }

    // Set up event listeners
    document.getElementById("analyzeButton").addEventListener("click", checkText);
    document.getElementById("refreshButton").addEventListener("click", fetchData);
    document.getElementById("updatesButton").addEventListener("click", fetchUpdates);

    // Initial data fetch
    fetchData();
  </script>
</body>
</html>
