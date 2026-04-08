export const state = {
  transactions: JSON.parse(localStorage.getItem('balance_history') || '[]'),
  people: JSON.parse(localStorage.getItem('balance_people') || '[]'),
  currentView: 'welcome'
};

export function saveState() {
  localStorage.setItem('balance_history', JSON.stringify(state.transactions));
  localStorage.setItem('balance_people', JSON.stringify(state.people));
}
