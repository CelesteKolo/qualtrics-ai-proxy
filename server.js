const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Fonction commune pour appeler ChatGPT
async function appellerChatGPT(systemPrompt, reponseParticipant) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: reponseParticipant }
      ],
      max_tokens: 600
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

// ── ENDPOINT 1 : feedback P-CUES ──────────────────────────────
app.post('/feedback-pcues', async (req, res) => {
  const { reponse_participant } = req.body;
  const systemPrompt = `Tu es un assistant pédagogique évaluant des résolutions
de problèmes de probabilité conditionnelle et de théorie de Bayes.

Évalue la réponse du participant UNIQUEMENT selon le critère P-CUES :

P-CUES (Complétude de la solution) :
Une solution complète et très bonne signifie que le participant réussit toutes
les étapes nécessaires pour résoudre le problème spécifique.
Une très mauvaise solution signifie qu'il ne réussit aucune étape.

Pour ce critère, indique :
- Si le participant répond au critère (oui / partiellement / non)
- Une note de 1 à 5 (1 = très mauvais, 5 = excellent)
- Un commentaire constructif et encourageant en 2-3 phrases

Sois bienveillant, précis et pédagogique. Réponds en français.`;

  try {
    const feedback = await appellerChatGPT(systemPrompt, reponse_participant);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération du feedback.' });
  }
});

// ── ENDPOINT 2 : feedback E-CUES ──────────────────────────────
app.post('/feedback-ecues', async (req, res) => {
  const { reponse_participant } = req.body;
  const systemPrompt = `Tu es un assistant pédagogique évaluant des résolutions
de problèmes de probabilité conditionnelle et de théorie de Bayes.

Évalue la réponse du participant UNIQUEMENT selon le critère E-CUES :

E-CUES (Qualité de l'explication) :
Une très bonne explication montre que le participant peut expliquer pourquoi
la tâche est caractérisée comme pertinente/non pertinente et avec/sans
remplacement. Elle montre aussi pour quels aspects de l'approche les principes
stochastiques jouent un rôle et pourquoi. Un aspect crucial est la capacité à
identifier et articuler clairement les zones où ces principes s'appliquent.
Une très mauvaise explication signifie que le participant est incapable
d'expliquer ces aspects.

Pour ce critère, indique :
- Si le participant répond au critère (oui / partiellement / non)
- Une note de 1 à 5 (1 = très mauvais, 5 = excellent)
- Un commentaire constructif et encourageant en 2-3 phrases

Sois bienveillant, précis et pédagogique. Réponds en français.`;

  try {
    const feedback = await appellerChatGPT(systemPrompt, reponse_participant);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération du feedback.' });
  }
});

// ── ENDPOINT 3 : pas de feedback (message neutre) ─────────────
app.post('/sans-feedback', async (req, res) => {
  res.json({ feedback: 'Merci pour ta réponse !' });
});

app.listen(3000, () => console.log('Serveur démarré'));
