import request from '@/utils/request.js';

export const getHealthDashboard = () => request.get('jk/health/dashboard');
export const saveGlucose = data => request.post('jk/health/glucose', data);
export const saveDiet = data => request.post('jk/health/diet', data);
export const saveExercise = data => request.post('jk/health/exercise', data);
export const saveMedicine = data => request.post('jk/health/medicine', data);
