import request from '@/utils/request.js';

export const getHealthDashboard = () => request.get('jk/health/dashboard');
export const getHealthProfile = () => request.get('jk/health/profile');
export const saveHealthProfile = data => request.post('jk/health/profile', data);
export const saveGlucose = data => request.post('jk/health/glucose', Object.assign({}, data, { requestNo: data.requestNo || ('GLUCOSE-' + Date.now()) }));
export const saveDiet = data => request.post('jk/health/diet', { occurredAt: data.eatenAt, category: data.mealType, content: data.foods, remark: data.remark, requestNo: 'DIET-' + Date.now() });
export const saveExercise = data => request.post('jk/health/exercise', { occurredAt: data.occurredAt, content: data.activity, durationMinutes: data.durationMinutes, calories: data.calories, remark: data.remark, requestNo: 'EXERCISE-' + Date.now() });
export const saveMedicine = data => request.post('jk/health/medicine', { occurredAt: data.takenAt, content: data.medicineName, category: data.dosage, remark: data.remark, requestNo: 'MEDICINE-' + Date.now() });
export const getHealthDataList = data => request.get('jk/health/data/list', data);
export const getHealthDataDetail = id => request.get('jk/health/data/' + id);
export const getHealthDevices = () => request.get('jk/health/device/list');
// 三诺设备状态由后端根据授权会话与首条 1003 数据聚合，页面不再猜测“准备中”。
export const getHealthDeviceStatus = () => request.get('jk/health/sinocare/device/status');
export const getGlucoseTrend = data => request.get('jk/health/glucose/trend', data);
export const getSinocareHealthReportList = data => request.get('jk/health/sinocare/report/list', data);
export const getSinocareHealthReportDetail = id => request.get('jk/health/sinocare/report/' + id);
export const bindHealthDevice = data => request.post('jk/health/device/bind', Object.assign({}, data, { requestNo: data.requestNo || ('BIND-' + Date.now()) }));
export const unbindHealthDevice = (id, reason = '') => request.post('jk/health/device/' + id + '/unbind?reason=' + encodeURIComponent(reason), {});
export const getHealthAuthorizations = () => request.get('jk/health/authorization/list');
export const getHealthAdvisorOptions = data => request.get('jk/health/authorization/advisor-options', data);
export const createHealthAuthorization = data => request.post('jk/health/authorization', Object.assign({}, data, { requestNo: data.requestNo || ('AUTH-' + Date.now()) }));
export const revokeHealthAuthorization = (id, reason = '') => request.post('jk/health/authorization/' + id + '/revoke?reason=' + encodeURIComponent(reason), {});
export const getAuthorizedHealthOwners = () => request.get('jk/health/authorized/owners');
export const getAuthorizedHealthData = (ownerUserId, data) => request.get('jk/health/authorized/' + ownerUserId + '/data', data);
export const getAuthorizedHealthProfile = ownerUserId => request.get('jk/health/authorized/' + ownerUserId + '/profile');

export const getHealthAlerts = data => request.get('jk/health/alert/list', data);
