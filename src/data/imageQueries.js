export const topicImageQueries = {
  'contrasenas-autenticacion': 'password security',
  'malware-antivirus': 'malware',
  'ingenieria-social': 'social engineering',
  'redes-sociales-privacidad': 'social media privacy',
  phishing: 'phishing email',
};

export const topicFallbackQueries = {
  'contrasenas-autenticacion': ['cyber security', 'computer security'],
  'malware-antivirus': ['cyber security', 'computer security'],
  'ingenieria-social': ['cyber security', 'computer security'],
  'redes-sociales-privacidad': ['cyber security', 'digital privacy'],
  phishing: ['cyber security', 'email security'],
};

export const lessonImageQueries = {
  'contrasenas-autenticacion': [
    'password security',
    'cyber attack',
    'authentication',
  ],
  'malware-antivirus': [
    'malware',
    'email attachment',
    'antivirus',
  ],
  'ingenieria-social': [
    'social engineering',
    'phone scam',
    'identity verification',
  ],
  'redes-sociales-privacidad': [
    'digital identity',
    'social media privacy',
    'privacy settings',
  ],
  phishing: [
    'phishing email',
    'phishing warning',
    'email security',
  ],
};

export function defaultTopicQuery(topic) {
  return topicImageQueries[topic.slug] || `${topic.name} cybersecurity`;
}

export function fallbackTopicQueries(topic) {
  return (
    topicFallbackQueries[topic.slug] || [
      'cyber security',
      'computer security',
    ]
  );
}

export function defaultLessonQuery(topic, lesson) {
  const queries = lessonImageQueries[topic.slug];
  const index = Math.max(0, Number(lesson.order || 1) - 1);

  return queries?.[index] || defaultTopicQuery(topic);
}
