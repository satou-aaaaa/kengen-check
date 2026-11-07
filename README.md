# この許可、いる？

アプリが求める許可（権限）や、偽のSMS・急に出る「ウイルス」の警告を見分けて、怪しいアプリを見ぬく1日5問のゲーム。押すだけ、時間制限なし。

- 遊ぶ: https://satou-aaaaa.github.io/kengen-check/
- 今日の5問（やさしい2・ふつう2・むずかしい1）はだれでも同じで1日1回。上級（むずかしい3問・ヒントなし）、練習（何度でも）、とことん（まちがえても続く・一発で何問見ぬけるか）、見ぬいた種類が集まる「見ぬき帳」があります。
- まちがえても選び直せます。正解すると「なぜ」と出典が出ます。ヒントは「見るところ」→「選び肢を2つにしぼる」の2段です。
- 問題は726問（19種類）。チケット・回数制限はありません。
- 文字の大きさは3段から選べます。見やすさの設定（読みやすい文字・色の見分け・動きを減らす・読み上げ）もあります。
- 機種を変えるときは「引き継ぎ」で、記録をコードと QR にして移せます。

## 中身の出どころ

アプリ・会社・送り主の名前はすべて作りものです。画面も実在のアプリやスマホの見た目ではありません。考え方と手口は次の公式の案内にもとづきます。

- [IPA「アプリのアクセス権限を確認しましょう」(2021)](https://www.ipa.go.jp/security/anshin/attention/2021/mgdayori20210914.html)：必要な権限だけを許可する・定期的に見直す・不安ならいったん許可せずに使う
- [IPA「宅配便業者等をかたる偽SMS」(2021)](https://www.ipa.go.jp/security/anshin/attention/2021/mgdayori20211222.html)：SMS のリンクから不正なアプリを入れさせる・提供元不明のアプリの許可
- [IPA「スマートフォンに偽のセキュリティ警告」(2022)](https://www.ipa.go.jp/security/anshin/attention/2022/mgdayori20221025.html)：警告からクリーナーアプリへ誘い、高い自動更新に登録させる・タブを閉じる・アプリを消しても解約にならない
- [IPA「遠隔操作ソフトの悪用」(2023)](https://www.ipa.go.jp/security/anshin/attention/2023/mgdayori20230411.html)：副業の誘いや偽の警告の電話番号から遠隔操作アプリを入れさせる・止めるには機内モード
- [Android ヘルプ「アプリの権限を変更する」](https://support.google.com/android/answer/9431959?hl=ja)・[位置情報の権限](https://developer.android.com/develop/sensors-and-location/location/permissions?hl=ja)・[実行時の権限](https://developer.android.com/training/permissions/requesting?hl=ja)
- [総務省 広報誌 令和6年2月号](https://www.soumu.go.jp/main_content/000926019.pdf)：SMS のリンク先に入力せず、公式サイト・公式アプリから

## 記録と通信

記録は遊ぶ人のブラウザにだけ残り、ゲームから自動で外へ送ることはありません。例外は2つ：文字（Google Fonts）を読み込むとき、まだ端末に保存が無ければ Google に IP アドレスが届きます。「Xで投稿」「LINEで送る」「結果をシェア」を押したときだけ、結果の文が選んだ先に渡ります（問題と答えは入りません）。

## 開発

```bash
bash scripts/setup.sh   # 最初に一度
node qa/run.mjs         # 検査（CI と同じ）
```

問題は `gen.js`（決まりは AGENTS.md）。

感想は [Issue のフォーム](https://github.com/satou-aaaaa/kengen-check/issues/new?template=feedback.yml) からどうぞ。
