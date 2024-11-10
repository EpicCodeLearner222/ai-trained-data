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
let humanPhrases = [];

async function fetchData() {
try {
const response = await fetch('https://raw.githubusercontent.com/EpicCodeLearner222/ai-trained-data/main/aitext.json');
if (!response.ok) {
throw new Error(`Network response was not ok. Status: ${response.status}`);
}
const data = await response.blob();
const dataSize = data.size;
const dataSizeKB = (dataSize / 1024).toFixed(2);
const dataSizeMB = (dataSize / (1024 * 1024)).toFixed(2);
const dataSizeGB = (dataSize / (1024 * 1024 * 1024)).toFixed(2);
const dataSizeTB = (dataSize / (1024 * 1024 * 1024 * 1024)).toFixed(2);

console.log(`Data fetched successfully. Size: ${dataSize} bytes, ${dataSizeKB} KB, ${dataSizeMB} MB, ${dataSizeGB} GB, ${dataSizeTB} TB`);

try {
const jsonData = await data.text();
const parsedData = JSON.parse(jsonData);

if (parsedData.humanText) {
humanText = parsedData.humanText.map(sentence => sentence.trim().toLowerCase().replace(/[^a-z]/g, ''));
}
if (parsedData.aiText) {
aiText = parsedData.aiText.map(sentence => sentence.trim().toLowerCase().replace(/[^a-z]/g, ''));
}
if (parsedData.humanPhrases) {
humanPhrases = parsedData.humanPhrases.map(phrase => phrase.trim().toLowerCase().replace(/[^a-z]/g, ''));
}
} catch (error) {
console.error('Error parsing JSON data:', error);
}
} catch (error) {
console.error('Error fetching data:', error.message);
}
}

function tokenize(text) {
return text.toLowerCase().replace(/[^a-z]/g, '');
}

function vectorize(tokens) {
const freqMap = {};
for (let token of tokens) {
freqMap[token] = (freqMap[token] || 0) + 1;
}
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
if (similarity > maxAiSimilarity) {
maxAiSimilarity = similarity;
}
});

humanText.forEach(sentence => {
const sentenceTokens = tokenize(sentence);
const sentenceVector = vectorize(sentenceTokens);
const similarity = cosineSimilarity(inputVector, sentenceVector);
if (similarity > maxHumanSimilarity) {
maxHumanSimilarity = similarity;
}
});

humanPhrases.forEach(phrase => {
if (inputText.includes(phrase)) {
humanPhraseSimilarity += 1;
}
});

const aiLikelihood = maxAiSimilarity / (maxAiSimilarity + maxHumanSimilarity);
let likelihood = (aiLikelihood * 100).toFixed(2);

// Adjust likelihood based on human phrase similarity
likelihood -= humanPhraseSimilarity * 5;
likelihood = Math.max(0, likelihood);

result.textContent = `Likelihood of AI-generated content: ${likelihood}%`;
}

document.addEventListener("DOMContentLoaded", async function() {
await fetchData();
document.getElementById("analyzeButton").addEventListener("click", checkText);
});
</script>
</body>
</html>
