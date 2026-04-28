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
  const reponse_participant = req.body.reponse_participant;
  if (!reponse_participant) {
    return res.status(400).json({ error: 'Réponse manquante' });
  }

  const systemPrompt = `Tu es un assistant pédagogique évaluant des solutions de problèmes de probabilités conditionnelles et du théorème de Bayes.
Évalue UNIQUEMENT la complétude de la solution selon ce critère :
Une solution complète et très bonne signifie que l'étudiant est capable d'effectuer avec succès TOUTES les étapes nécessaires pour résoudre le problème, à savoir identifier la probabilité a priori, calculer la probabilité totale, appliquer correctement le théorème de Bayes et interpréter le résultat obtenu.
Une très mauvaise solution signifie qu'il n'est capable d'effectuer aucune des étapes nécessaires.
Donne une note de 1 à 5 et un commentaire constructif de 2-3 phrases en français.
Format de réponse : Note : X/5\nCommentaire : [ton commentaire]`;

  appellerOpenAI(systemPrompt, reponse_participant, function(err, feedback) {
    if (err) {
      console.error('Erreur p-cues:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ feedback: feedback });
  });
});

// ─── ENDPOINT E-CUES ─────────────────────────────────────────────────────────
app.post('/feedback-ecues', function(req, res) {
  const reponse_participant = req.body.reponse_participant;
  if (!reponse_participant) {
    return res.status(400).json({ error: 'Réponse manquante' });
  }

  const systemPrompt = `Tu es un assistant pédagogique évaluant des explications de problèmes de probabilités conditionnelles et du théorème de Bayes.
Évalue UNIQUEMENT la qualité de l'explication selon ce critère :
Une très bonne explication montre que l'étudiant est capable d'expliquer POURQUOI chaque étape est nécessaire, quel rôle jouent la rareté de l'événement (probabilité a priori) et la précision du test (vraisemblance), et comment ces éléments se combinent pour produire la probabilité finale.
Il doit identifier précisément à quelle étape chaque principe intervient et pour quelle raison.
Une très mauvaise explication signifie qu'il est incapable d'expliquer ces aspects.
Donne une note de 1 à 5 et un commentaire constructif de 2-3 phrases en français.
Format de réponse : Note : X/5\nCommentaire : [ton commentaire]`;

  appellerOpenAI(systemPrompt, reponse_participant, function(err, feedback) {
    if (err) {
      console.error('Erreur e-cues:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ feedback: feedback });
  });
});

// ─── ENDPOINT SANS FEEDBACK ──────────────────────────────────────────────────
app.post('/sans-feedback', function(req, res) {
  res.json({ feedback: 'Merci pour votre réponse.' });
});

// ─── DÉMARRAGE ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Serveur démarré sur le port ' + PORT);
});
