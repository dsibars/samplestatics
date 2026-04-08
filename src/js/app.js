import '../css/base.css';
import '../css/app.css';

import { applyTranslations, changeLanguage, t } from './i18n.js';
import { updateActiveDate, resetToToday, showSettings, closeSettings, exportJSON, importJSON, clearAllData, showExit, showRoutine, closeRoutine, routineDragStart, routineDragOver, routineDragEnter, routineDragLeave, routineDrop, removeRoutineStep, openAddExercise, closeAddExercise, updateExercisePreview, appendNewExercise } from './configuration.js';
import { startWorkout, processStep, changeVal } from './workout.js';
import { showHistory, toggleCard } from './statistics.js';

// --- Initialization ---
window.onload = () => {
  applyTranslations();
  updateActiveDate();
};

// --- Global Window Bindings for HTML onclick attributes ---
window.startWorkout = startWorkout;
window.changeVal = changeVal;
window.processStep = processStep;
window.showHistory = showHistory;
window.toggleCard = toggleCard;
window.showSettings = showSettings;
window.closeSettings = closeSettings;
window.exportJSON = exportJSON;
window.importJSON = importJSON;
window.clearAllData = clearAllData;
window.showExit = showExit;
window.changeLanguage = changeLanguage;
window.updateActiveDate = updateActiveDate;
window.resetToToday = resetToToday;
window.showRoutine = showRoutine;
window.closeRoutine = closeRoutine;
window.routineDragStart = routineDragStart;
window.routineDragOver = routineDragOver;
window.routineDragEnter = routineDragEnter;
window.routineDragLeave = routineDragLeave;
window.routineDrop = routineDrop;
window.removeRoutineStep = removeRoutineStep;
window.openAddExercise = openAddExercise;
window.closeAddExercise = closeAddExercise;
window.updateExercisePreview = updateExercisePreview;
window.appendNewExercise = appendNewExercise;
window.t = t;
