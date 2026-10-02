import fs from 'fs';
import path from 'path';

// Read keys from .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const keys = {};

envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    keys[key.trim()] = rest.join('=').trim();
  }
});

async function testOpenAI() {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${keys.OPENAI_API_KEY}` }
  });
  console.log(`OpenAI API Key: ${res.ok ? '✅ WORKING' : '❌ FAILED (' + res.status + ')'}`);
}

async function testGroq() {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${keys.GROQ_API_KEY}` }
  });
  console.log(`Groq API Key: ${res.ok ? '✅ WORKING' : '❌ FAILED (' + res.status + ')'}`);
}

async function testGemini() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys.GEMINI_API_KEY}`);
  console.log(`Gemini API Key: ${res.ok ? '✅ WORKING' : '❌ FAILED (' + res.status + ')'}`);
}

async function runTests() {
  console.log("Testing API Keys...");
  await testOpenAI();
  await testGroq();
  await testGemini();
}

runTests();
