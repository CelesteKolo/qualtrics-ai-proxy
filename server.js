const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());
app.use(express.json());

function appellerOpenAI(systemPrompt, reponse_participant, callback) {
  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: reponse_participant }
    ]
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = https.request(options, function(res) {
    let data = '';
    res.on('data', function(chunk) { data += chunk; });
    res.on('end', function() {
      try {
        const parsed = JSON.parse(data);
        if (parsed.choices && parsed.choices[0]) {
          callback(null, parsed.choices[0].message.content);
        } else {
          callback('Réponse OpenAI invalide : ' + data);
        }
      } catch (e) {
        callback('Erreur parsing : ' + e.message);
      }
    });
  });

  req.on('error', function(e) {
    callback('Erreur requête : ' + e.message);
  });

  req.write(body);
  req.end();
}

// ─── ENDPOINT P-CUES ─────────────────────────────────────────────────────────
app.post('/feedback-pcues', function(req, res) {
  co
