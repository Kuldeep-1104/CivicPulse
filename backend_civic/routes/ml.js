// backend_civic/routes/ml.js
import express from "express";
const router = express.Router();

// Simple keyword-based priority predictor
function predictPriorityFromText(text = "") {
  const t = (text || "").toLowerCase();

  const highWords = [
    "urgent","emergency","immediate","critical","danger","dangerous",
    "fire","accident","collapse","falling","injury","life","rescue","hazard","help"
  ];
  const mediumWords = [
    "broken","damaged","leak","repair","blocked","overflow","pothole",
    "flood","pipe","not working","street light","garbage","sewage","drain"
  ];
  const lowWords = [
    "request","suggestion","clean","cleaning","smell","maintenance","improvement","nice"
  ];

  if (highWords.some(w => t.includes(w))) return "High";
  if (mediumWords.some(w => t.includes(w))) return "Medium";
  if (lowWords.some(w => t.includes(w))) return "Low";
  return "Low";
}

router.post("/predict-priority", (req, res) => {
  try {
    const { text } = req.body;
    const priority = predictPriorityFromText(text);
    return res.json({ priority });
  } catch (err) {
    console.error("ML predict error:", err);
    return res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;