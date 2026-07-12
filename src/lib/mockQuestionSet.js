import { supabase } from '../supabase'
import {
  getMockQuestionLimit,
  normalizeDifficulty,
  pickMockQuestions,
  shouldFilterMockDifficulty,
} from './mockContract'

export async function loadMockQuestionSet(mock) {
  let query = supabase
    .from('jee_mains')
    .select('id, subject, chapter, topic, difficulty, type, question, options, correct_options, answer, explanation')
    .in('type', ['mcq', 'integer'])
    .eq('is_out_of_syllabus', false)
  if (mock.subject) query = query.eq('subject', mock.subject)
  if (mock.chapter) query = query.eq('chapter', mock.chapter)
  if (mock.topic) query = query.eq('topic', mock.topic)
  if (shouldFilterMockDifficulty(mock)) {
    query = query.eq('difficulty', normalizeDifficulty(mock.difficulty))
  }
  query = query.order('id', { ascending: true }).limit(2000)
  const { data, error } = await query
  if (error) throw error
  return pickMockQuestions(data || [], getMockQuestionLimit(mock))
}
