export const state = {
  tasks: JSON.parse(localStorage.getItem('todo_list_tasks') || '[]'),
  currentView: 'welcome'
};

export function saveState() {
  localStorage.setItem('todo_list_tasks', JSON.stringify(state.tasks));
}
