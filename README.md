# 🦞 shamela-mcp — بحث ودراسة في المكتبة الشاملة ٤

**إضافة MCP** توصل المساعد إلى آلاف كتب المكتبة الشاملة المثبَّتة محلياً — قراءةً فقط وبدون خادم وسيط. العدد الدقيق للكتب والمؤلفين يخص جهازك وينمو شهرياً؛ أداة `shamela_health` تعطيك أرقام اللحظة.

- الإصدار **١٫٤٫٠** — **٣٥ أداة** بحث وقراءة وتوثيق
- **التوافق:** OpenClaw (WSL2 أو Windows) + DSH + Claude Desktop + أي عميل MCP

> 📌 **هذا المستودع:** نسخة معدّلة عن [alhoqbani/shamela-mcp](https://github.com/alhoqbani/shamela-mcp) — الشكر كله له. نعمل من مصدره ونضيف فوقه طبقة التوافق.

## ✨ القدرات

- بحث في نصوص آلاف الكتب (متن + حواشي + تعليقات) مع بحث صرفي وبدائل
- تصفية النطاق: كتب، مؤلفون، تصنيفات، فترات هجرية
- قراءة صفحات وأبواب وفهارس كاملة
- قرآن كريم (بحث + آيات بالرسم الإملائي والعثماني) + ربط بالتفاسير
- تخريج أحاديث وربطها بمصادرها عبر فهارس الشاملة
- صياغة إحالات جاهزة للنشر بنمط الشاملة
- أدوات جديدة: `verify_quote` (تحقق من نص منقول)، `scan_consensus` (مسح الإجماع/الخلاف)، `research_scope` (تغطية المذاهب)، `suggest_download` (إرشاد الكتب)

## 🚀 التركيب

### OpenClaw (WSL2 أو Windows)

```bash
git clone https://github.com/SMSMy/shamela-mcp.git
cd shamela-mcp
npm install && npm run build

openclaw mcp set shamela '{
  "command": "node",
  "args": ["'$(pwd)'/dist/index.js"],
  "cwd": "'$(pwd)'"
}'

openclaw mcp reload
```

### DSH (DeepSeek Harness)

أضف صفاً إلى ملف الـ preset النشط (`~/.dsh/.agent-presets/<preset>/agent.cordis.yml`):

```yaml
- id: mcp-shamela
  name: '@deepseek-ai/dsh-mcp-client'
  config:
    serverName: shamela
    transport: stdio
    command: node
    args: ['<مسار المشروع>/dist/index.js']
```

ثم أعد تشغيل المضيف أو افتح جلسة جديدة (الجلسات الحية تبقى على الجيل القديم). مهارة `shamela-researcher` (انظر أدناه) تُحمَّل عبر أداة `skill`.

### Claude Desktop

ثبّت ملف `shamela-mcp-<الإصدار>.mcpb` من صفحة الإصدارات (Releases).

### المتغيرات البيئية (اختيارية)

| المتغير | الوصف |
|---|---|
| `SHAMELA_INSTALL_ROOT` | مسار مجلد الشاملة ٤ (يحتوي `database/` و`app/`) — **اختياري**: الإضافة تكتشف المسار تلقائياً (سجل النظام على ويندوز + المسارات الشائعة) |
| `SHAMELA_JRE` | مسار Java — **اختياري**: تُستخدم جافا المرفقة مع الشاملة تلقائياً. في WSL2 اضبطه على جافا لينكس (مثل `/usr/bin/java`) |

> ⚠️ الشرط: الشاملة ٤ مثبّتة على جهازك مع كتاب منزَّل واحد على الأقل.

## 📚 توثيق للمساعد (الأجنت) والمطوّر

- **[AGENTS.md](AGENTS.md)** — تعليمات الاستخدام الإلزامية، محمولة لكل البيئات (اقرأها قبل أول بحث)
- **[skills/shamela-researcher/](skills/shamela-researcher/SKILL.md)** — مهارة قواعد البحث التفصيلية (تضييق/توسيع، صفر النتائج، النسبة والأمانة، دليل الأدوات الـ34)
- **[CLAUDE.md](CLAUDE.md)** — دليل المطوّر/الصيانة (بناء، اختبار، حماية main، الإصدار)

## ✅ جرّب

> «ابحث في المكتبة الشاملة عن «الكلام» وأخبرني في أي الكتب وردت ومع من.»

إذا ظهر اسم الكتاب والمؤلف ورقم الصفحة ومقتطف — تعمل.

## 🔧 ملاحظات البناء (WSL2)

تحت WSL2 مع `javac.exe` من ويندوز، سكربت البناء يحوّل الـ classpath تلقائياً لمسارات Windows:

```bash
SHAMELA_INSTALL_ROOT=/mnt/d/shamela4 npm run build
```

## 📦 الترخيص

MIT — [راجع LICENSE](LICENSE). الإضافة تقرأ بيانات الشاملة قراءةً فقط ولا تعدّل شيئًا.
