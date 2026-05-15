/**
 * Validates the structure of mode outputs.
 * Provides fallback structures if validation fails.
 */

const validateQAOutput = (data) => {
  // data should be a JSON object with { answer, sources }
  if (typeof data === 'object' && data !== null && data.answer) {
    return {
      answer: String(data.answer),
      sources: Array.isArray(data.sources) ? data.sources.map(s => ({
        page_number: s.page_number || 1,
        confidence_score: typeof s.confidence_score === 'number' ? s.confidence_score : 0.5,
        extracted_text: String(s.extracted_text || ''),
      })) : [],
    }
  }
  // Backward compat: if it's a raw HTML string, wrap it
  if (typeof data === 'string' && data.trim()) {
    return { answer: data, sources: [] }
  }
  return { answer: 'No answer generated.', sources: [] }
}

const validateSummaryOutput = (data) => {
  // data should be a structured JSON object
  if (typeof data === 'object' && data !== null) {
    return {
      title: data.title || 'Document Summary',
      overview: data.overview || '',
      reading_time_minutes: data.reading_time_minutes || 5,
      total_topics: data.total_topics || 0,
      sections: Array.isArray(data.sections) ? data.sections.map(s => ({
        heading: s.heading || 'Section',
        icon: s.icon || '📘',
        content: s.content || '',
        key_points: Array.isArray(s.key_points) ? s.key_points : [],
        importance: ['high', 'medium', 'low'].includes(s.importance) ? s.importance : 'medium',
      })) : [],
      key_terms: Array.isArray(data.key_terms) ? data.key_terms.map(t => ({
        term: t.term || '',
        definition: t.definition || '',
      })) : [],
      quick_revision: Array.isArray(data.quick_revision) ? data.quick_revision : [],
      connections: Array.isArray(data.connections) ? data.connections : [],
    }
  }
  // Backward compat: if it's a raw HTML string
  if (typeof data === 'string' && data.trim()) {
    return {
      title: 'Document Summary',
      overview: data,
      reading_time_minutes: 5,
      total_topics: 0,
      sections: [],
      key_terms: [],
      quick_revision: [],
      connections: [],
    }
  }
  return {
    title: 'Summary',
    overview: 'No summary generated.',
    reading_time_minutes: 0,
    total_topics: 0,
    sections: [],
    key_terms: [],
    quick_revision: [],
    connections: [],
  }
}

const validateQuizOutput = (data) => {
  const questions = Array.isArray(data.questions) ? data.questions : []
  return {
    questions: questions.map((q, i) => ({
      id: q.id || i + 1,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
      question: q.question || '',
      options: q.options || {},
      correct_answer: q.correct_answer || 'A',
      explanation: q.explanation || '',
    })),
  }
}

const validateMindMapOutput = (data) => {
  const sanitize = (node) => {
    if (!node || typeof node !== 'object') return { topic: 'Unknown', description: '', children: [] }
    return {
      topic: node.topic || 'Untitled',
      description: node.description || '',
      children: Array.isArray(node.children) ? node.children.map(sanitize) : [],
    }
  }
  return sanitize(data)
}

/**
 * Validate output based on mode.
 */
const validateOutput = (data, mode) => {
  switch (mode) {
    case 'qa':      return validateQAOutput(data)
    case 'summary': return validateSummaryOutput(data)
    case 'quiz':    return validateQuizOutput(data)
    case 'mindmap': return validateMindMapOutput(data)
    default:        return data
  }
}

module.exports = { validateOutput, validateQAOutput, validateSummaryOutput, validateQuizOutput, validateMindMapOutput }
