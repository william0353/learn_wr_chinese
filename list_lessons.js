const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'lesson_index.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const lessons = JSON.parse(data);

  console.log('--- 汉字课程列表概览 ---');
  lessons.forEach((lesson) => {
    const words = lesson.words.map(w => w.text).join(', ');
    console.log(`第 ${String(lesson.id).padStart(2, ' ')} 课: ${words}`);
  });
  console.log('------------------------');
  console.log(`总计: ${lessons.length} 课`);
} catch (err) {
  console.error('无法读取或解析 lesson_index.json:', err.message);
}
