const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'lesson_index.json');

const newSentences = {
  21: "你和他在家里坐。",
  22: "我在门口看见他。",
  23: "他在门口立着看。",
  24: "你好，我想问你话。",
  25: "天上月明，还有星星。",
  26: "我从外面来到家里。",
  27: "我今天早早起床了。",
  28: "我和爸爸在家里坐。",
  29: "这是什么东西你看。",
  30: "我在家里看一本书。",
  31: "山上有很多大石头。",
  32: "我在家里好好休息。",
  33: "我们有很多好朋友。",
  34: "我想说一句好话。",
  35: "他有一个好名字。",
  36: "我爱我的好老师。",
  37: "我从左边走到右边。",
  38: "我每天上学写字用手。",
  39: "我从里面慢慢走出来。",
  40: "我早上起床先洗手。",
  41: "我的同学都很好谢谢你。"
};

try {
  const data = fs.readFileSync(filePath, 'utf8');
  let lessons = JSON.parse(data);

  lessons.forEach((lesson) => {
    if (newSentences[lesson.id]) {
      const sentenceText = newSentences[lesson.id];
      // 检查是否已经存在该句子
      const exists = lesson.words.some(w => w.text === sentenceText);
      if (!exists) {
        lesson.words.push({
          id: `s${lesson.id}`,
          text: sentenceText,
          type: "sentence",
          pron: ""
        });
        console.log(`已向第 ${lesson.id} 课插入句子: ${sentenceText}`);
      } else {
        console.log(`第 ${lesson.id} 课已存在该句子，跳过`);
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2), 'utf8');
  console.log('文件更新完成。');
} catch (err) {
  console.error('操作失败:', err.message);
}
