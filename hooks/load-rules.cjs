const fs = require('node:fs');
const path = require('node:path');

try {
  const event = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^\uFEFF/, ''));
  const eventName = event.hook_event_name;
  if (eventName !== 'SessionStart' && eventName !== 'SubagentStart' && eventName !== 'UserPromptSubmit') {
    throw new Error('不支持的 Hook 事件');
  }
  if (eventName === 'SessionStart' &&
      !['startup', 'resume', 'clear', 'compact'].includes(event.source)) {
    throw new Error('不支持的会话启动来源');
  }

  const skill = fs.readFileSync(path.join(__dirname, '../skills/plain-talk/SKILL.md'), 'utf8');
  const frontmatter = skill.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!frontmatter || !skill.slice(frontmatter[0].length).trim()) {
    throw new Error('SKILL.md 缺少有效头部或正文');
  }
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: '明白话已加载。以下规则用于本任务中的回答、解释和结果汇报；用户明确要求的文体和格式优先。\n\n' + skill.slice(frontmatter[0].length).trim(),
    },
  }));
} catch (error) {
  console.error(`明白话加载失败：${error.message}`);
  process.exitCode = 1;
}
