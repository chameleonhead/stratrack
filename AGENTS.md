# このプロジェクトは

FX の戦略を開発するためのアプリケーションです。
戦略を登録し、バックテストなどをアプリケーション上で実行し、
最終的な成果物として MT4 または MT5 の EA を作成します。

# 開発の注意

マルチ言語のモノリポジトリーで各フォルダ毎に開発環境の構成は異なります。
バグに対処する場合は再現するためのテストコードを作成し、再現させてから対処してください。

## api プロジェクト

C# & Azure Functions のアプリケーションです。backend/ の代わりに開発を進めています。
開発や修正を行った際は `dotnet test api/stratrack-backend.sln -c Release` を実行し、テストが成功することを確認してください。

## backend プロジェクト

Python の FastAPI プロジェクトで当初はこの形でリリースするつもりでしたが、C# で開発するように方針を変更したので今後開発は api を進めます。
廃止予定のプロジェクトです。

## frontend プロジェクト

1. vite + React のプロジェクトです。
2. `npm run format` で Prettier を適用してください。
3. `npm run lint` と `npm run test` を実行し、エラーが無いことを確認してください。
4. React コンポーネントを追加・変更した場合は Storybook 用の `*.stories.tsx` ファイルを作成してください。
5. ピュアなコードのテストをするときは vitest を使い、コンポーネントのテストをするときは storybook の play 関数を使用してください。
6. play 関数を利用する際はモックを利用せず、できる限り msw で対応してください。
7. Storybook 用のテストヘルパーは `@storybook/testing-library` ではなく、`storybook/test` を使用してください。Storybook 9 以降は `storybook` パッケージに統合されています。
8. ビルドが通ることを確認するため、`npm run build` を実行してください。

## データソース管理について

- Dukascopy の tick データは `data-sources/{id}/ticks` でアップロードできます。
- アップロードデータは 1 時間単位の CSV を base64 文字列として受け取り、`Blob` テーブルに保存します。
- `data_chunk` テーブルは `data_source_id`, `start_time`, `end_time`, `blob_id` を管理し、データ本体と切り離して扱います。
- チャンク情報はデータソースドメインで管理し、`DataChunk` エンティティを `DataSources` フォルダに配置してください。
- Blob 保存処理は `IBlobStorage` インターフェイス経由で実装し、デフォルトではデータベースに保存します。
