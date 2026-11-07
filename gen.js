// この許可、いる？ の問題（ブラウザと node の両方で使う）。
// 問題は全部ここに並べて作る（BANK）。1問は「種類|中身の名前」の key を持ち、同じ key ならいつも同じ問題・同じ並びの選び肢になる。
// 中身は公式の案内に合わせる（出どころは SRC。遊び方・README にも書く）。アプリの名前はすべて架空。実在のアプリ・会社の名前は使わない。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ日なら、どの端末でも同じ問題になる。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出どころ（短い名前と URL）
  const SRC = {
    ipa1: ["IPA「アプリのアクセス権限を確認しましょう」(2021)", "https://www.ipa.go.jp/security/anshin/attention/2021/mgdayori20210914.html"],
    ipa2: ["IPA「宅配便業者等をかたる偽SMS」(2021)", "https://www.ipa.go.jp/security/anshin/attention/2021/mgdayori20211222.html"],
    ipa3: ["IPA「スマートフォンに偽のセキュリティ警告」(2022)", "https://www.ipa.go.jp/security/anshin/attention/2022/mgdayori20221025.html"],
    ipa4: ["IPA「遠隔操作ソフトの悪用」(2023)", "https://www.ipa.go.jp/security/anshin/attention/2023/mgdayori20230411.html"],
    gand: ["Android ヘルプ「アプリの権限を変更する」", "https://support.google.com/android/answer/9431959?hl=ja"],
    dloc: ["Android Developers「位置情報の権限」", "https://developer.android.com/develop/sensors-and-location/location/permissions?hl=ja"],
    dreq: ["Android Developers「実行時の権限をリクエストする」", "https://developer.android.com/training/permissions/requesting?hl=ja"],
    soumu: ["総務省 広報誌 令和6年2月号「サイバーセキュリティを見直してみましょう」", "https://www.soumu.go.jp/main_content/000926019.pdf"],
  };

  // 権限（Android の権限の名前に合わせる）。t: "o"=許可/許可しない、"u"=使用中のみ/許可しない、"l"=位置情報
  const PERM = {
    contacts: { n: "連絡先", ic: "👥", t: "o", what: "電話帳に入っている名前や電話番号" },
    sms: { n: "SMS", ic: "✉️", t: "o", what: "SMS（ショートメッセージ）を読む・送る" },
    phone: { n: "電話", ic: "📞", t: "o", what: "電話をかける・電話の状態を見る" },
    calllog: { n: "通話履歴", ic: "🗒️", t: "o", what: "だれといつ電話したかの記録" },
    calendar: { n: "カレンダー", ic: "📅", t: "o", what: "カレンダーの予定を読む・書く" },
    photo: { n: "写真と動画", ic: "🖼️", t: "o", what: "端末の中の写真と動画" },
    activity: { n: "身体活動", ic: "🏃", t: "o", what: "歩数や歩いた・走ったの動き" },
    nearby: { n: "付近のデバイス", ic: "📡", t: "o", what: "近くのイヤホンなどの機器を探してつなぐ" },
    notif: { n: "通知", ic: "🔔", t: "o", what: "お知らせを画面に出す" },
    camera: { n: "カメラ", ic: "📷", t: "u", what: "カメラで写す" },
    mic: { n: "マイク", ic: "🎤", t: "u", what: "マイクで音を拾う" },
    loc: { n: "位置情報", ic: "📍", t: "l", what: "今いる場所" },
  };
  const OPT = { o: ["許可", "許可しない"], u: ["アプリの使用中のみ許可", "許可しない"], l: ["正確な位置・常に許可", "正確な位置・使用中のみ", "おおよその位置・使用中のみ", "許可しない"] };
  const ANS = { allow: "許可", use: "アプリの使用中のみ許可", fine: "正確な位置・使用中のみ", coarse: "おおよその位置・使用中のみ", no: "許可しない" };

  // アプリ（すべて架空）。need は仕事に要る権限と、そのときの答え
  const APPS = [
    { id: "light", ic: "🔦", names: ["ぱっとライト", "てらすライト", "あかりポケット"], d: "画面を明るくして、懐中電灯のかわりにする", need: {} },
    { id: "calc", ic: "🧮", names: ["すいすい電卓", "かんたん計算", "まる電卓"], d: "足し算やわり算をする電卓", need: {} },
    { id: "puzzle", ic: "🧩", names: ["ぴたっとパズル", "ならべてブロック", "ひとり詰め将棋"], d: "1人で遊ぶパズル", need: {} },
    { id: "wall", ic: "🌄", names: ["かべがみ集", "けしき壁紙", "季節のかべがみ"], d: "画面の背景の絵を選ぶ", need: {} },
    { id: "book", ic: "📚", names: ["よみもの文庫", "まいにち読書", "しおり本棚"], d: "買った本を読む", need: {} },
    { id: "recipe", ic: "🍳", names: ["きょうの献立", "おかずノート", "ささっとレシピ"], d: "料理の作り方を見る", need: {} },
    { id: "kakei", ic: "💴", names: ["かんたん家計簿", "おこづかい帳", "まいつき家計"], d: "使ったお金を自分で書いて記録する", need: {} },
    { id: "font", ic: "🔠", names: ["もじデコ", "かわいい文字", "てがき風フォント"], d: "文字の形をかざる", need: {} },
    { id: "photo", ic: "🎨", names: ["きらり写真加工", "ふわっと加工", "いろどりフォト"], d: "端末の写真の明るさや色を整える", need: { photo: "allow" } },
    { id: "walk", ic: "👟", names: ["てくてく歩数計", "あるこう日記", "まんぽメーター"], d: "毎日歩いた歩数を数える", need: { activity: "allow" } },
    { id: "plan", ic: "🗓️", names: ["よていちょう", "まいにち予定", "てちょうメモ"], d: "カレンダーに予定を書き、時刻に知らせる", need: { calendar: "allow", notif: "allow" } },
    { id: "alarm", ic: "⏰", names: ["めざまし時計", "おはようアラーム", "ねぼう番"], d: "決めた時刻に音を鳴らして知らせる", need: { notif: "allow" } },
    { id: "ear", ic: "🎧", names: ["イヤホンつなぐ", "おとあわせ", "ワイヤレス調整"], d: "近くのワイヤレスイヤホンとつないで音を整える", need: { nearby: "allow" } },
    { id: "dial", ic: "☎️", names: ["れんらく帳", "でんわ帳プラス", "かぞく連絡"], d: "知り合いの電話番号をまとめて、押して電話をかける", need: { contacts: "allow", phone: "allow" } },
    { id: "camera", ic: "📸", names: ["まいにちカメラ", "すなっぷカメラ", "ほのぼの写真機"], d: "写真と、声の入った動画をとる", need: { camera: "use", mic: "use" } },
    { id: "qr", ic: "🔳", names: ["QRよみとり", "さっと読み取り", "コードリーダー"], d: "カメラで QR コードを読み取る", need: { camera: "use" } },
    { id: "voice", ic: "🎙️", names: ["こえメモ", "ききとり録音", "ボイスノート"], d: "声を録音してメモにする", need: { mic: "use" } },
    { id: "trans", ic: "🔤", names: ["ことば通訳", "はなして翻訳", "たびの通訳"], d: "話した言葉を別の国の言葉に訳す", need: { mic: "use" } },
    { id: "map", ic: "🗺️", names: ["みちしるべ地図", "まちあるきナビ", "たどりつく地図"], d: "今いる場所から目的地まで道を案内する", need: { loc: "fine" } },
    { id: "taxi", ic: "🚕", names: ["タクシーよぶ", "のりばナビ", "むかえ車"], d: "今いる場所まで車を呼ぶ", need: { loc: "fine" } },
    { id: "sky", ic: "⛅", names: ["あしたの天気", "そらもよう", "まちの天気"], d: "開いたとき、いる地域の天気予報を出す", need: { loc: "coarse" } },
    { id: "news", ic: "📰", names: ["地域ニュース", "まちの話題", "ご近所トピック"], d: "開いたとき、いる地域のニュースを出す", need: { loc: "coarse" } },
  ];
  const APP = Object.fromEntries(APPS.map((a) => [a.id, a]));
  // 「使用中のみ」で足りる。位置を常に知らせる仕事のアプリは置いていない（バックグラウンドの位置情報は別の許可。dloc）
  // 「要らない」と言い切れない組（アプリの作りしだいで使うことがある）。問題にしない。通知はどのアプリでも使いうるので全部外す
  const AMBIG = new Set([
    "wall:photo", "font:photo", "photo:camera", "photo:loc", "kakei:camera", "kakei:photo", "recipe:photo", "book:photo",
    "camera:photo", "camera:loc", "qr:photo", "trans:camera", "walk:loc", "plan:loc", "plan:contacts", "dial:sms", "dial:calllog", "dial:photo",
    "taxi:phone", "taxi:contacts", "map:photo", "map:calendar", "alarm:calendar", "alarm:mic", "ear:mic", "voice:photo", "voice:calendar",
    "sky:calendar", "news:photo", "news:calendar", "walk:calendar", "walk:nearby", "puzzle:nearby", "camera:nearby", "photo:nearby", "trans:loc", "camera:mic",
  ]);

  // まちがいでなくても「迷いやすい」組（ふつうの見直しに使う）。写真加工に SMS は IPA の例そのもの
  const SNEAK = [["photo", "sms"], ["photo", "contacts"], ["light", "contacts"], ["light", "loc"], ["puzzle", "contacts"], ["puzzle", "calllog"], ["wall", "phone"], ["font", "sms"], ["calc", "calllog"], ["kakei", "sms"], ["book", "mic"], ["recipe", "camera"], ["walk", "contacts"], ["alarm", "sms"], ["ear", "contacts"], ["qr", "contacts"], ["voice", "loc"], ["sky", "contacts"], ["news", "calllog"], ["map", "sms"]];

  const B = []; // BANK
  const add = (kind, id, p) => B.push({ key: kind + "|" + id, kind, ...p });

  // ---- 権限の画面（やさしい：仕事に要らない／要る、ふつう：時間・場所の細かさ） ----
  for (const a of APPS) a.names.forEach((nm, ni) => {
    for (const p of Object.keys(PERM)) {
      const P = PERM[p], t = P.t, need = a.need[p];
      const scene = { t: "perm", app: { ic: a.ic, n: nm, d: a.d }, perm: p };
      const base = { scene, opts: OPT[t], src: t === "l" ? ["dloc", "gand"] : ["ipa1", "gand"] };
      if (!need) {
        // 要らない：はっきり要らない組だけ（仕事しだいで要ることがある組は AMBIG で外す）
        if (p === "notif" || AMBIG.has(a.id + ":" + p)) continue;
        const lv = t === "o" ? 0 : 1;
        add(t === "o" ? "nope" : t === "u" ? "nocam" : "noloc", `${a.id}-${p}-${ni}`, { ...base, lv, ans: ANS.no,
          why: `「${a.d}」アプリに、${P.n}は要りません。仕事に要らない許可は出さないのが基本です。` });
      } else if (need === "allow") {
        add("need", `${a.id}-${p}-${ni}`, { ...base, lv: 0, ans: ANS.allow, why: `「${a.d}」には、${P.n}（${P.what}）が要ります。仕事に見合う許可なので、出してよい場面です。` });
      } else if (need === "use") {
        add("usecam", `${a.id}-${p}-${ni}`, { ...base, lv: 1, ans: ANS.use, why: `${P.n}は、使っているあいだだけあれば足ります。「アプリの使用中のみ」にすると、閉じているときは使われません。` });
      } else {
        add(need === "fine" ? "fineloc" : "coarse", `${a.id}-${p}-${ni}`, { ...base, lv: need === "fine" ? 1 : 2, ans: ANS[need],
          why: need === "fine" ? "道案内や車を呼ぶには、正確な位置が要ります。ただ、使っているときだけで足ります。「常に」は要りません。"
            : "地域の天気・ニュースなら、おおよその位置（だいたい3平方キロメートルの広さ）で足ります。正確な位置や「常に」は要りません。" });
      }
    }
  });

  // ---- 入れたあとの見直し（ふつう）：設定の一覧で、仕事に合わない許可を見つけたら ----
  SNEAK.forEach(([aid, p]) => APP[aid].names.forEach((nm, ni) => {
    const a = APP[aid], P = PERM[p];
    add("review", `${aid}-${p}-${ni}`, { lv: 1, scene: { t: "set", app: { ic: a.ic, n: nm, d: a.d }, perm: p },
      opts: ["そのままにする", "許可を取り消す（要らないアプリなら消す）", "ほかの許可もまとめて出す"], ans: "許可を取り消す（要らないアプリなら消す）", src: ["ipa1", "gand"],
      why: `「${a.d}」アプリに${P.n}は要りません。設定の「アプリ」→「権限」で取り消せます。ときどき見直すのがおすすめです。` });
  }));

  // ---- 場面の問題 ----
  const SMS = [
    ["お荷物をお届けしましたが、宛先が不明のため持ち帰りました。下記よりご確認ください。", "配送のお知らせ"],
    ["ご不在のため、お荷物を持ち帰りました。再配達の受付はこちら。", "配達センター"],
    ["【重要】お客さまのご利用料金のお支払いが確認できません。至急ご確認ください。", "料金センター"],
    ["お荷物の住所に不備があります。24時間以内に確認しないと返送されます。", "お届けサービス"],
    ["【重要】ご契約の確認が必要です。期限までに手続きがない場合、利用を止めます。", "契約窓口"],
    ["ご注文の品の発送に問題がありました。こちらから詳細をご確認ください。", "発送のご案内"],
  ];
  SMS.forEach(([text, from], i) => {
    add("smslink", "s" + i, { lv: 0, scene: { t: "sms", from, text, link: "http://nimotsu-kakunin.test/" + "abc"[i % 3] + i },
      opts: ["リンクを開いて、言われたアプリを入れる", "リンクは開かず、公式アプリや公式サイトで確かめる", "SMSに返信して確かめる"], ans: "リンクは開かず、公式アプリや公式サイトで確かめる", src: ["ipa2", "soumu"],
      why: "宅配便や料金をよそおう偽のSMSから、偽のアプリを入れさせる手口があります。リンクは押さず、自分で開いた公式アプリ・公式サイトで確かめます。" });
    add("unknown", "s" + i, { lv: 1, scene: { t: "dlg", from: "SMSのリンクから開いたページ", text: `「荷物の確認アプリ」を入れるには、このブラウザに「不明なアプリのインストール」を許可してください。`, hint: from },
      opts: ["許可して入れる", "許可しない"], ans: "許可しない", src: ["ipa2"],
      why: "公式ストアの外からアプリを入れる許可です。偽のSMSから不正なアプリを入れさせる手口で使われます。許可したままにもしないようにします。" });
  });
  const WARN = [
    "ウイルスが4個見つかりました！ 今すぐ駆除アプリを入れてください。",
    "お使いのスマホは98%こわれています。すぐに掃除アプリで直してください。",
    "警告：あなたの端末は危険にさらされています。下のボタンから保護アプリを入れてください。",
    "電池がウイルスで弱っています。今すぐ無料アプリで直しましょう。",
    "ウイルス感染を検出しました。この画面を閉じると、データが消えるおそれがあります。",
    "システムが古くなっています。安全のため、このアプリをすぐに入れてください。",
  ];
  WARN.forEach((text, i) => {
    add("fakewarn", "w" + i, { lv: 0, scene: { t: "warn", text },
      opts: ["表示されたアプリを入れる", "「OK」を押して先へ進む", "画面にさわらず、ブラウザのタブを閉じる"], ans: "画面にさわらず、ブラウザのタブを閉じる", src: ["ipa3"],
      why: "サイトを見ているときに急に出る「ウイルス」の警告は偽物のことがあります。「OK」や「閉じる」を押すと次の画面へ進むことがあるので、タブごと閉じます。" });
  });
  const SUBS = [["週900円", "ウイルスを3個検出しました。駆除するにはプレミアムプラン（週900円）に登録してください。"], ["年24,200円", "危険なファイルが見つかりました。年間プラン（年24,200円）で今すぐ守りましょう。"], ["週900円", "まだ守られていません！ 3日間の無料体験のあと、週900円で自動更新されます。"], ["月1,500円", "スマホが重くなっています。月1,500円のプランで、ずっと軽くしましょう。"]];
  SUBS.forEach(([price, text], i) => {
    add("subs", "c" + i, { lv: 1, scene: { t: "inapp", app: { ic: "🧹", n: ["すっきりクリーナー", "まもるガード", "そうじ名人", "ささっと最適化"][i] }, text },
      opts: ["登録して駆除する", "登録しない（偽の警告から入れたアプリなら消す）", "無料体験だけ登録しておく"], ans: "登録しない（偽の警告から入れたアプリなら消す）", src: ["ipa3"],
      why: `偽の警告で入れさせたアプリが、また「ウイルス」と出して高い自動更新（${price}など）に登録させる手口があります。無料体験も、そのまま続くと料金がかかります。` });
  });
  add("cancel", "c0", { lv: 2, scene: { t: "q", text: "高い自動更新のプランに登録してしまった。アプリを消せば、お金は止まる？" },
    opts: ["アプリを消せば止まる", "ストアの「定期購入」の画面で解約する", "しばらく開かなければ止まる"], ans: "ストアの「定期購入」の画面で解約する", src: ["ipa3"],
    why: "アプリを消しただけでは、定期購入は解約されません。ストアの定期購入の画面で解約されたかまで確かめます。" });
  add("cancel", "c1", { lv: 2, scene: { t: "q", text: "無料体験に登録したアプリを消した。これで料金はかからない？" },
    opts: ["消したので、かからない", "ストアの「定期購入」の画面で解約されたか確かめる", "アプリをもう一度入れれば止まる"], ans: "ストアの「定期購入」の画面で解約されたか確かめる", src: ["ipa3"],
    why: "アプリを消しても定期購入は残ります。無料体験のあとは自動で料金がかかるので、ストアの定期購入の画面で解約します。" });
  const BEFORE = [["アイコンの色", "広告で見た回数"], ["名前がかわいいか", "画面の写真がきれいか"], ["ダウンロードのボタンの大きさ", "「今だけ無料」と書いてあるか"]];
  BEFORE.forEach(([x, y], i) => {
    add("before", "b" + i, { lv: 1, scene: { t: "store", app: { ic: ["🛡️", "🧹", "📶"][i], n: ["まもるガード", "すっきりクリーナー", "はやわざ通信"][i] }, text: "ストアでアプリを見つけた。入れる前に、まず何を確かめる？" },
      opts: shuffleFixed(["開発元・料金・利用規約", x, y], i), ans: "開発元・料金・利用規約", src: ["ipa3", "ipa1"],
      why: "入れる前に、だれが作ったか（開発元）・機能・料金・利用規約を、ストアの詳しい説明で確かめます。" });
  });
  const REMOTE = [
    ["副業の窓口", "スマホだけで1日1万円！ 作業のために、このアプリを入れて、出てきた番号（ID）を教えてください。"],
    ["お仕事サポート", "設定を手伝います。画面を見られるアプリを入れて、IDを送ってください。"],
    ["かんたん副業", "登録を代わりにやります。遠隔で操作できるアプリを入れて、接続を「許可」してください。"],
    ["サポート担当", "うまく動かないので、こちらで直します。指定のアプリを入れて番号を読み上げてください。"],
  ];
  REMOTE.forEach(([from, text], i) => {
    add("remote", "r" + i, { lv: 2, scene: { t: "dm", from, text },
      opts: ["言われたとおりに入れる", "入れない・IDも教えない", "IDだけ教える"], ans: "入れない・IDも教えない", src: ["ipa4"],
      why: "遠隔操作のアプリを入れてIDを教え、接続を許可すると、相手があなたのスマホを動かせます。お金を借りさせ、送金させた例もあります。" });
  });
  add("remotestop", "x0", { lv: 2, scene: { t: "q", text: "知らない人に遠隔操作されているかもしれない。今すぐ止めるには？" },
    opts: ["機内モードにしてネットを切る", "相手に止めてと頼む", "そのまま終わるまで待つ"], ans: "機内モードにしてネットを切る", src: ["ipa4"],
    why: "機内モードにしてネットを切るか、画面をロックすると止められます。そのあと、そのアプリを消します。" });
  add("remotestop", "x1", { lv: 2, scene: { t: "q", text: "遠隔操作のアプリを、言われて入れてしまった。終わったあとは？" },
    opts: ["次も使うので残す", "アプリを終わらせて、消す", "IDだけ変えて残す"], ans: "アプリを終わらせて、消す", src: ["ipa4"],
    why: "遠隔操作のアプリは、待ち受けていると相手につながれるおそれがあります。終わったら終了して消します。" });
  const TEL = ["お使いの端末からウイルスが検出されました。サポートセンター（0120-xxx-xxx）に今すぐお電話ください。", "セキュリティ警告：このまま使うと情報がもれます。担当窓口 050-xxxx-xxxx へ。", "ロックされました。解除するには、下の番号のサポートに連絡してください。"];
  TEL.forEach((text, i) => {
    add("telwarn", "t" + i, { lv: 2, scene: { t: "warn", text, tel: true },
      opts: ["書いてある番号に電話する", "電話せず、画面を閉じる", "番号をメモして、あとで電話する"], ans: "電話せず、画面を閉じる", src: ["ipa4", "ipa3"],
      why: "偽の警告に電話番号を出し、電話した人に遠隔操作のアプリを入れさせる手口があります。電話はかけず、画面を閉じます。" });
  });
  const DENY = [["お絵かきアプリ", "連絡先"], ["メモ帳アプリ", "位置情報"], ["ゲーム", "マイク"]];
  DENY.forEach(([an, pn], i) => {
    add("denytry", "d" + i, { lv: 2, scene: { t: "q", text: `${an}が「${pn}」の許可をたずねてきた。何に使うのか分からず、不安…` },
      opts: ["とりあえず許可する", "いったん許可しないで使ってみる", "アプリの評価が高ければ許可する"], ans: "いったん許可しないで使ってみる", src: ["ipa1", "dreq"],
      why: "不安なときは、いったん許可せずに使ってみます。多くのアプリは、許可しなくても使える所は使えます。あとから設定で変えることもできます。" });
  });
  add("later", "l0", { lv: 0, scene: { t: "q", text: "前に「許可」したけれど、やっぱりやめたい。あとから変えられる？" },
    opts: ["一度許可したら変えられない", "設定の「アプリ」→「権限」でいつでも変えられる", "アプリを入れ直すしかない"], ans: "設定の「アプリ」→「権限」でいつでも変えられる", src: ["gand", "ipa1"],
    why: "設定の「アプリ」から各アプリの「権限」を開くと、許可と許可しないを切り替えられます。" });
  add("later", "l1", { lv: 0, scene: { t: "q", text: "「カメラ」を許可しているアプリを、まとめて見たい。どこで見る？" },
    opts: ["設定の権限の一覧（権限マネージャ）", "ストアのおすすめの画面", "カメラで写した写真の中"], ans: "設定の権限の一覧（権限マネージャ）", src: ["gand"],
    why: "Android では、設定の「セキュリティとプライバシー」→「プライバシー」→「権限マネージャ」で、権限ごとに許可しているアプリが分かります。" });
  add("later", "l2", { lv: 0, scene: { t: "q", text: "何か月も使っていないアプリ。Android では、その権限はどうなることがある？" },
    opts: ["自動で取り消されることがある", "ずっと増えていく", "ほかのアプリにうつる"], ans: "自動で取り消されることがある", src: ["dreq"],
    why: "新しい Android では、数か月使っていないアプリの大事な権限を、システムが自動で取り消すことがあります。" });

  function shuffleFixed(arr, i) { const a = arr.slice(); const r = (i * 7 + 3) % a.length; return a.slice(r).concat(a.slice(0, r)); }

  // 種類：id・難しさ・帳に出す名前・見るところ（ヒント1）
  const KINDS = [
    { id: "nope", lv: 0, name: "仕事に要らない許可", look: "このアプリの仕事を読んで、その許可が本当に要るか考えてみましょう。" },
    { id: "need", lv: 0, name: "仕事に要る許可", look: "このアプリの仕事を読んで、その許可が無いと仕事ができないか考えてみましょう。" },
    { id: "smslink", lv: 0, name: "あせらせるSMS", look: "急がせるSMSのリンクから入れるアプリは、本物でしょうか。" },
    { id: "fakewarn", lv: 0, name: "ウイルスの警告", look: "その警告は、自分で入れたアプリが出したものでしょうか。サイトの中に出たものでしょうか。" },
    { id: "later", lv: 0, name: "あとから変える", look: "許可は、スマホの「設定」で見られます。" },
    { id: "usecam", lv: 1, name: "使っているときだけ", look: "カメラやマイクは、アプリを閉じているときにも要るでしょうか。" },
    { id: "nocam", lv: 1, name: "要らないカメラ・マイク", look: "このアプリの仕事に、写すことや音を拾うことは入っていますか。" },
    { id: "noloc", lv: 1, name: "要らない位置情報", look: "このアプリの仕事に、今いる場所は要りますか。" },
    { id: "fineloc", lv: 1, name: "正確な位置", look: "道や車を案内するには、どれくらい細かい場所が要るでしょうか。いつ要るでしょうか。" },
    { id: "review", lv: 1, name: "許可の見直し", look: "このアプリの仕事に、その許可は要りますか。" },
    { id: "unknown", lv: 1, name: "ストアの外から入れる", look: "公式のストアの外からアプリを入れる許可です。だれが作ったアプリでしょうか。" },
    { id: "subs", lv: 1, name: "高い自動更新", look: "ウイルスと出たのは、警告から入れたアプリの中です。" },
    { id: "before", lv: 1, name: "入れる前に見る所", look: "だれが作ったか、お金はかかるか、が分かる所はどこでしょう。" },
    { id: "coarse", lv: 2, name: "おおよその位置", look: "地域の天気やニュースなら、何メートル単位の場所まで要るでしょうか。" },
    { id: "remote", lv: 2, name: "遠隔操作のアプリ", look: "IDを教えると、相手は何ができるようになるでしょうか。" },
    { id: "remotestop", lv: 2, name: "遠隔操作を止める", look: "遠隔操作は、ネットがつながっているときだけ動きます。" },
    { id: "telwarn", lv: 2, name: "電話番号つきの警告", look: "本物の会社の警告に、電話をかけさせる番号は出るでしょうか。" },
    { id: "cancel", lv: 2, name: "定期購入の解約", look: "お金の登録は、アプリではなくストアにあります。" },
    { id: "denytry", lv: 2, name: "迷ったときは", look: "許可は、あとからでも出せます。" },
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);
  const BANK = Object.fromEntries(B.map((q) => [q.key, q]));
  const keysOf = (kind) => B.filter((q) => q.kind === kind).map((q) => q.key);

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickN = (R, arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

  // 1問を作る。tag は key（「種類|中身」）。権限の画面の選び肢は端末の並びのまま、場面の問題は key の種で並べ替える
  function make(tag) {
    const q = BANK[tag]; if (!q) return null;
    const k = BY[q.kind], opts = q.scene.t === "perm" ? q.opts.slice() : pickN(rng(seedOf(tag)), q.opts, q.opts.length);
    return { tag, kind: q.kind, lv: k.lv, name: k.name, look: k.look, scene: q.scene, opts, ans: q.ans, why: q.why, src: q.src.map((s) => SRC[s]) };
  }
  const pickKey = (R, kind) => { const ks = keysOf(kind); return ks[Math.floor(R() * ks.length)]; };

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id) => pickKey(R, id));
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = BANK[dailyTags(date)[4]].kind, R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id) => pickKey(R, id));
  }

  const G = { KINDS, BY, LV, SRC, PERM, APPS, BANK, keysOf, kindsOf, seedOf, rng, make, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = G; else root.KENGEN = G;
})(typeof self !== "undefined" ? self : this);
