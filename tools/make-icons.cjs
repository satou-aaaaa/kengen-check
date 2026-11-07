// アプリのアイコン（icon-192.png・icon-512.png）を作る。藍の地に、白いスマホと朱の「？」の盾。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#24427a"/>
      <rect x="26" y="14" width="40" height="70" rx="8" fill="#fff" stroke="#142a52" stroke-width="2"/>
      <rect x="40" y="18" width="12" height="2.5" rx="1.2" fill="#1f2a4455"/>
      <rect x="31" y="30" width="30" height="5" rx="2" fill="#dbe4ef"/><rect x="31" y="39" width="22" height="5" rx="2" fill="#dbe4ef"/>
      <path d="M66 46 L84 52 L84 66 C84 76 76 82 66 86 C56 82 48 76 48 66 L48 52 Z" fill="#b8402a" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="66" y="75" font-size="24" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="900">?</text></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
