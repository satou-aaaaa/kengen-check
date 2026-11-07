// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、遊び方の例（懐中電灯のアプリが連絡先をほしがる）だけ。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:60px 70px;background:#eef2f4;color:#1f2a44;display:flex;gap:56px;align-items:center">
    <div style="flex:1">
      <div style="font-size:32px;color:#86291a;letter-spacing:.06em">怪しいアプリを見ぬく1日5問</div>
      <div style="font-size:104px;font-weight:900;margin-top:10px;color:#142a52;white-space:nowrap">この許可、<span style="color:#b8402a">いる？</span></div>
      <div style="font-size:36px;margin-top:18px;line-height:1.5">アプリの許可・偽のSMS・急な警告<br>公式の案内にもとづく・時間制限なし</div>
    </div>
    <div style="width:330px;background:#fff;border:6px solid #1f2a44;border-radius:44px;padding:28px 24px;box-sizing:border-box;box-shadow:0 14px 0 #1f2a4422">
      <div style="display:flex;gap:14px;align-items:center"><div style="font-size:54px">🔦</div><div style="font-size:28px;font-weight:900;white-space:nowrap">ライトのアプリ</div></div>
      <div style="margin-top:20px;background:#f2f4f7;border-radius:26px;padding:22px;text-align:center;font-size:30px;line-height:1.5">
        <div style="font-size:48px">👥</div><b style="color:#142a52">連絡先</b>の<br>利用を許可<br>しますか？
        <div style="margin-top:16px;border:4px solid #24427a;border-radius:18px;padding:10px;font-weight:900">許可</div>
        <div style="margin-top:12px;border:4px solid #24427a;border-radius:18px;padding:10px;font-weight:900">許可しない</div>
      </div>
    </div>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
