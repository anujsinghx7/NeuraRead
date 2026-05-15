const natural = require('natural')
const trainingData = require('./classifierData.json')

/**
 * Naive Bayes Classifier — trained once at server startup.
 *
 * Uses the `natural` library's BayesClassifier.
 * Topics covered: DL, ML, DBMS, OS, CN, DSA, MATH
 *
 * Usage:
 *   const { classifier } = require('./classifier')
 *   const label = classifier.classify("some text about neural networks")
 *   // → "DL"
 */

let classifier = null

/**
 * Trains the Naive Bayes classifier from classifierData.json.
 * Called once when the server starts. Subsequent calls return immediately.
 */
const trainClassifier = () => {
  if (classifier) return // Already trained — do not retrain

  const start = Date.now()

  classifier = new natural.BayesClassifier()

  for (const { text, label } of trainingData) {
    classifier.addDocument(text, label)
  }

  classifier.train()

  const elapsed = Date.now() - start
  console.log(`✅ Classifier trained successfully in ${elapsed} ms (${trainingData.length} samples, ${getUniqueLabels()} labels)`)
}

/**
 * Classifies a text string and returns the predicted topic label.
 * Falls back to "GENERAL" if the classifier is not yet trained or
 * if classification fails for any reason.
 *
 * @param {string} text - Input text to classify
 * @returns {string} Predicted label (e.g. "ML", "DBMS", "OS")
 */
const classifyText = (text) => {
  if (!classifier) {
    console.warn('⚠️  Classifier not yet trained. Returning "GENERAL".')
    return 'GENERAL'
  }

  try {
    return classifier.classify(text)
  } catch {
    return 'GENERAL'
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUniqueLabels = () => {
  const labels = new Set(trainingData.map((d) => d.label))
  return labels.size
}

module.exports = { trainClassifier, classifyText }
