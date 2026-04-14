import test from 'node:test';
import assert from 'node:assert';

// Mock localStorage BEFORE importing the module
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    }
  };
})();

global.localStorage = localStorageMock;

// Dynamic import to ensure global.localStorage is set
const { state, saveState } = await import('./state.js');

test('saveState persists tasks to localStorage', () => {
  localStorage.clear();
  state.tasks = [{ id: 1, text: 'Test Task', completed: false }];

  saveState();

  const storedTasks = JSON.parse(localStorage.getItem('todo_list_tasks'));
  assert.deepStrictEqual(storedTasks, state.tasks);
});

test('saveState handles empty task list', () => {
  localStorage.clear();
  state.tasks = [];

  saveState();

  const storedTasks = JSON.parse(localStorage.getItem('todo_list_tasks'));
  assert.deepStrictEqual(storedTasks, []);
});

test('saveState correctly stringifies tasks with special characters', () => {
  localStorage.clear();
  state.tasks = [{ id: 2, text: 'Special !@#$%^&*()_+ characters', completed: true }];

  saveState();

  const storedTasks = JSON.parse(localStorage.getItem('todo_list_tasks'));
  assert.deepStrictEqual(storedTasks, state.tasks);
});
