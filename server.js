const express = require('express');
const cors = require('cors');
const app = express();
 
app.use(cors());
app.use(express.json());
 
// ─── ENDPOINT P-CUES (feedback sur la complétude de la solution) ───────────
app.post('/feedback-pcues', async (req, res) => {
  const { reponse_participant } = req.body;
  if (!reponse_participant) {
    return res.status(400).json({ error: 'Réponse manquante' });
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant pédagogique évaluant des solutions de problèmes
de probabilités conditionnelles et du théorème de Bayes.
Évalue UNIQUEMENT la complétude de la solution selon ce critère :
Une solution complète et très bonne signifie que l'étudiant est capable
d'effectuer avec succès TOUTES les étapes nécessaires pour résoudre le problème.
Une très mauvaise solution signifie qu'il n'est capable d'effectuer aucune
des étapes nécessaires.
Donne un commentaire constructif de 2-3 phrases en français.
Format de réponse : Commentaire : [ton commentaire]`
          },
          {
            role: 'user',
            content: reponse_participant
          }
        ]
      })
    });
    const data = await response.json();
    const feedback = data.choices[0].message.content;
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
 
// ─── ENDPOINT E-CUES (feedback sur la qualité de l'explication) ────────────
app.post('/feedback-ecues', async (req, res) => {
  const { reponse_participant } = req.body;
  if (!reponse_participant) {
    return res.status(400).json({ error: 'Réponse manquante' });
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant pédagogique évaluant des explications de problèmes
de probabilités conditionnelles et du théorème de Bayes.
Évalue UNIQUEMENT la qualité de l'explication selon ce critère :
Une très bonne explication montre que l'étudiant est capable d'expliquer POURQUOI
chaque étape est nécessaire, quel rôle jouent la rareté de l'événement (probabilité
a priori) et la précision du test (vraisemblance), et comment ces éléments se
combinent pour produire la probabilité finale. Il doit identifier précisément
à quelle étape chaque principe intervient et pour quelle raison.
Une très mauvaise explication signifie qu'il est incapable d'expliquer ces aspects.
Donne un commentaire constructif de 2-3 phrases en français.
Format de réponse : Commentaire : [ton commentaire]`
          },
          {
            role: 'user',
            content: reponse_participant
          }
        ]
      })
    });
    const data = await response.json();
    const feedback = data.choices[0].message.content;
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
 
// ─── ENDPOINT SANS FEEDBACK (message neutre) ────────────────────────────────
app.post('/sans-feedback', async (req, res) => {
  res.json({ feedback: 'Merci pour votre réponse.' });
});
 
// ─── DÉMARRAGE DU SERVEUR ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Serveur démarré sur le port ' + PORT);
});
