const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'App.vue'), 'utf8');
const exercise = fs.readFileSync(path.join(root, 'pages/jk/health/exercise.vue'), 'utf8');
if (app.includes('\\t@import')) throw new Error('App.vue contains a literal \\t before an SCSS import');
if (!exercise.includes('</view></view></view></template>')) throw new Error('exercise.vue root view is not closed before </template>');
console.log('ui1.1 syntax regression contract passed');
