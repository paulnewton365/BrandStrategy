/**
 * Text Analysis Utilities
 * 
 * Programmatic word frequency counting from interview transcripts.
 * The AI identifies WHICH concepts to track and how to group them;
 * all actual counts are computed here from real text.
 */

export interface SpeakerInfo {
  name: string;
  initials: string;
  totalWords: number;
}

export interface ConceptCount {
  concept: string;
  searchTerms: string[];
  counts: Record<string, number>; // speakerInitials -> count
}

export interface ConceptDefinition {
  name: string;
  searchTerms: string[];
}

export interface RadarDimensionDefinition {
  subject: string;
  conceptNames: string[];
}

// ─── Speaker initials extraction ───
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(w => w.length > 0);
  if (parts.length === 0) return 'XX';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return parts.map(w => w[0].toUpperCase()).join('').slice(0, 2);
}

// ─── Count occurrences of a set of terms in text ───
// Uses word-boundary matching, case insensitive
export function countTermOccurrences(text: string, terms: string[]): number {
  const lowerText = ' ' + text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ') + ' ';
  let total = 0;

  for (const term of terms) {
    const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use word boundaries - \b works for most cases
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    const matches = lowerText.match(regex);
    total += matches ? matches.length : 0;
  }

  return total;
}

// ─── Count total words in text ───
export function countTotalWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// ─── Compute concept frequencies across all interviews ───
export function computeConceptFrequencies(
  interviews: Array<{ name: string; content: string }>,
  conceptDefs: ConceptDefinition[]
): { speakers: SpeakerInfo[]; concepts: ConceptCount[] } {

  // Build speaker info
  const speakers: SpeakerInfo[] = interviews.map(int => ({
    name: int.name,
    initials: getInitials(int.name),
    totalWords: countTotalWords(int.content),
  }));

  // Handle initial collisions (e.g., two speakers with same initials)
  const seen = new Set<string>();
  for (const speaker of speakers) {
    let initials = speaker.initials;
    let suffix = 2;
    while (seen.has(initials)) {
      // Append a number to disambiguate
      initials = speaker.initials[0] + String(suffix);
      suffix++;
    }
    speaker.initials = initials;
    seen.add(initials);
  }

  // Count each concept per speaker
  const concepts: ConceptCount[] = conceptDefs.map(def => {
    const counts: Record<string, number> = {};
    interviews.forEach((int, i) => {
      counts[speakers[i].initials] = countTermOccurrences(int.content, def.searchTerms);
    });
    return {
      concept: def.name,
      searchTerms: def.searchTerms,
      counts,
    };
  });

  return { speakers, concepts };
}

// ─── Compute radar dimension values by summing concept counts ───
export function computeRadarFromConcepts(
  concepts: ConceptCount[],
  speakers: SpeakerInfo[],
  dimensions: RadarDimensionDefinition[]
): Array<Record<string, string | number>> {

  return dimensions.map(dim => {
    const row: Record<string, string | number> = { subject: dim.subject };

    for (const speaker of speakers) {
      let total = 0;
      for (const conceptName of dim.conceptNames) {
        // Fuzzy match concept name (AI might return slightly different casing)
        const concept = concepts.find(
          c => c.concept.toLowerCase() === conceptName.toLowerCase()
        );
        if (concept) {
          total += concept.counts[speaker.initials] || 0;
        }
      }
      row[speaker.initials] = total;
    }

    return row;
  });
}

// ─── Stop words for top-word extraction ───
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'that', 'this', 'these', 'those', 'it', 'its',
  'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'he', 'him',
  'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which',
  'who', 'whom', 'where', 'when', 'how', 'why', 'not', 'no', 'nor',
  'if', 'then', 'than', 'so', 'as', 'just', 'about', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'out',
  'off', 'over', 'under', 'again', 'further', 'once', 'here', 'there',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'only', 'own', 'same', 'very', 'too', 'also',
  'really', 'quite', 'like', 'think', 'know', 'going', 'gonna',
  'get', 'got', 'go', 'went', 'come', 'came', 'make', 'made',
  'take', 'took', 'see', 'saw', 'look', 'say', 'said', 'tell',
  'told', 'ask', 'asked', 'want', 'wanted', 'right', 'well',
  'thing', 'things', 'way', 'people', 'yeah', 'yes', 'okay',
  'um', 'uh', 'kind', 'sort', 'lot', 'much', 'many', 'part',
  'even', 'still', 'back', 'because', 'something', 'anything',
  'everything', 'nothing', 'someone', 'anyone', 'everyone',
  'up', 'down', 'now', 'new', 'old', 'first', 'last', 'long',
  'great', 'good', 'big', 'small', 'little', 'different', 'able',
  'actually', 'one', 'two', 'three', 'four', 'five', 'ten',
  'don', 'doesn', 'didn', 'won', 'isn', 'aren', 'wasn', 'weren',
  'hasn', 'haven', 'hadn', 'wouldn', 'couldn', 'shouldn', 'mustn',
  've', 'll', 're', 'mean', 'means', 'whether', 'always', 'never',
]);

// ─── Extract top non-stopword words from text ───
export function getTopWords(
  text: string,
  topN: number = 40
): Array<{ word: string; count: number }> {
  const words = text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/);
  const freq = new Map<string, number>();

  for (const word of words) {
    const cleaned = word.replace(/^['-]+|['-]+$/g, '');
    if (cleaned.length < 3 || STOP_WORDS.has(cleaned)) continue;
    freq.set(cleaned, (freq.get(cleaned) || 0) + 1);
  }

  const result: Array<{ word: string; count: number }> = [];
  freq.forEach((count, word) => {
    result.push({ word, count });
  });

  return result
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

// ─── Build a frequency context string for the AI ───
// Shows top words per speaker so the AI can identify meaningful concepts
export function buildFrequencyContext(
  interviews: Array<{ name: string; content: string }>
): string {
  if (interviews.length === 0) return '';

  let context = `\n=== WORD FREQUENCY ANALYSIS (computed from transcripts) ===\n\n`;

  for (const interview of interviews) {
    const initials = getInitials(interview.name);
    const totalWords = countTotalWords(interview.content);
    const topWords = getTopWords(interview.content, 30);

    context += `--- ${interview.name} (${initials}) | ${totalWords.toLocaleString()} words ---\n`;
    context += `Top terms: ${topWords.map(w => `${w.word}(${w.count})`).join(', ')}\n\n`;
  }

  return context;
}
