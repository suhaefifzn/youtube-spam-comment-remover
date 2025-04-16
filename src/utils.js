/**
 * Get komentar yang terdapat keyword spam
 */
export const getSpamComment = (text, spamKeywords) => {
  /**
   * Mengubah karakter aneh ke bentuk yang setara secara makna
   * NFKD -> Normalization Form Compability Decomposition
   */
  const normalizedText = text.normalize("NFKD");

  if (text !== normalizedText) {
    return true;
  }

  text = text.toLowerCase();

  return spamKeywords.some(({ word }) => text.includes(word.toLowerCase()));
};