<!DOCTYPE html>
<html>
<head>
  <title>AI Detector</title>
</head>
<body>
  <h1>AI Detector</h1>
  <input id="inputText" type="text" placeholder="Enter text to analyze">
  <button id="analyzeButton">Analyze</button>
  <div id="result"></div>

  <script>
let humanText = [];
let aiText = [];

async function fetchData() {
try {
const response = await fetch('https://raw.githubusercontent.com/EpicCodeLearner222/ai-trained-data/main/aitext.json');
if (!response.ok) {
throw new Error(`Network response was not ok. Status: ${response.status}`);
}
const data = await response.json();
humanText = data.humanText.map(sentence => sentence.trim().toLowerCase());
aiText = data.aiText.map(sentence => sentence.trim().toLowerCase());
console.log("Data fetched successfully.");
} catch (error) {
console.error('Error fetching data:', error.message);
// Add error handling code here, e.g., display an error message to the user
}
}

function tokenize(text) {
return text.toLowerCase().split(/\W+/).filter(Boolean);
}

function vectorize(tokens) {
const freqMap = {};
tokens.forEach(token => {
freqMap[token] = (freqMap[token] || 0) + 1;
});
return freqMap;
}

function cosineSimilarity(vec1, vec2) {
const intersection = Object.keys(vec1).filter(key => key in vec2);
const dotProduct = intersection.reduce((sum, key) => sum + vec1[key] * vec2[key], 0);
const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));
return magnitude1 && magnitude2? dotProduct / (magnitude1 * magnitude2) : 0;
}

function checkText() {
const inputText = document.getElementById("inputText").value.trim().toLowerCase();
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

let totalAiSimilarity = 0;
let totalHumanSimilarity = 0;

aiText.forEach(sentence => {
const sentenceTokens = tokenize(sentence);
const sentenceVector = vectorize(sentenceTokens);
const similarity = cosineSimilarity(inputVector, sentenceVector);
totalAiSimilarity += similarity;
});

humanText.forEach(sentence => {
const sentenceTokens = tokenize(sentence);
const sentenceVector = vectorize(sentenceTokens);
const similarity = cosineSimilarity(inputVector, sentenceVector);
totalHumanSimilarity += similarity;
});

const avgAiSimilarity = totalAiSimilarity / aiText.length;
const avgHumanSimilarity = totalHumanSimilarity / humanText.length;

if (avgAiSimilarity === 0 && avgHumanSimilarity === 0) {
likelihood = 50; // or any other default value you prefer
} else {
const aiLikelihood = avgAiSimilarity / (avgAiSimilarity + avgHumanSimilarity);
likelihood = (aiLikelihood * 100).toFixed(2);
}

result.textContent = `Likelihood of AI-generated content: ${likelihood}%`;
}

document.addEventListener("DOMContentLoaded", async function() {
await fetchData();
document.getElementById("analyzeButton").addEventListener("click", checkText);
}); // Add this closing parenthesis
  </script>
</body>
</html>
