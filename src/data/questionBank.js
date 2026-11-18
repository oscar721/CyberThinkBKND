import { contrasenasQuestions } from './questionBanks/contrasenas.js';
import { malwareQuestions } from './questionBanks/malware.js';
import { ingenieriaQuestions } from './questionBanks/ingenieria.js';
import { redesQuestions } from './questionBanks/redes.js';
import { phishingQuestions } from './questionBanks/phishing.js';

export const questionBanks = {
  'contrasenas-autenticacion': contrasenasQuestions,
  'malware-antivirus': malwareQuestions,
  'ingenieria-social': ingenieriaQuestions,
  'redes-sociales-privacidad': redesQuestions,
  phishing: phishingQuestions,
};
