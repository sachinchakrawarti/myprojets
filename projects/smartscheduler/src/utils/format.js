export const getCellStyle = (subject) => {
  if (subject === 'BREAK') return 'bg-yellow-100 text-yellow-800 font-semibold';
  if (subject === 'LUNCH') return 'bg-orange-100 text-orange-800 font-semibold';
  if (subject && subject.includes('LAB')) return 'bg-blue-50 text-blue-700';
  if (!subject || subject === '') return 'bg-gray-50 text-gray-400';
  return 'bg-white text-gray-700';
};

export const formatSubject = (subject) => {
  if (!subject || subject === '') return '-';
  return subject;
};