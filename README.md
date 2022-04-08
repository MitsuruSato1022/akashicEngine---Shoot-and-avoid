# sample-introduction

**sample-introduction** は JavaScript で Akashic のゲームを作る際のサンプルプロジェクトをもとに作成したオリジナルゲームです。

## 遊び方
バウンドする弾を相手にぶつけて最後まで生き残るゲームです。
弾を撃った数が生き残った時ポイントとして獲得できますが、バウンドした弾は自分にも当たる為、状況をよく観ながら攻めと避けを切り替える必要があります。

### 基本操作

`自機以外の場所をクリック` 自機を移動させる
`自機をクリック`弾を発射

### アセットの更新方法

各種アセットを追加したい場合は、それぞれのアセットファイルを以下のディレクトリに格納します。

- 画像アセット: `image`
- スクリプトアセット: `script`
- テキストアセット: `text`
- オーディオアセット: `audio`

これらのアセットを追加・変更したあとに `akashic scan asset` をすると、アセットの変更内容をもとに `game.json` を書き換えることができます。

### npm モジュールの追加・削除

`sample-introduction` で npm モジュールを利用する場合、このディレクトリで `akashic install <package_name>` することで npm モジュールを追加することができます。

また `akashic uninstall <package_name>` すると npm モジュールを削除することができます。

## エクスポート方法

`sample-introduction` をエクスポートするときは以下のコマンドを利用します。

### html ファイルのエクスポート

`akashic export html -o game` のコマンドを利用することで `game` ディレクトリにエクスポートすることができます。

`game/index.html` をブラウザで開くと単体動作させることができます。

### zip ファイルのエクスポート

`akashic export zip -o game.zip` のコマンドを利用することで `game.zip` という名前の zip ファイルを出力できます。

## テスト方法

以下のコマンドで [ESLint](https://github.com/eslint/eslint "ESLint")を使った Lint が実行されます。
スクリプトアセット内に ES5 構文に反する記述がある場合エラーを返します。

```sh
npm run lint
```
