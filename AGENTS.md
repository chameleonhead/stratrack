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
9. サーバー通信を行う処理ではローディングまたは処理中の状態を画面上に表示し、ボタンは二度押しできないようにしてください。
10. エラー発生時は一貫した方法でユーザーに通知し、メッセージを表示してください。

## コーディングスタイルと使用ライブラリ

- API は Azure Functions と EventFlow を利用した CQRS / Event Sourcing 構成です。
- データアクセスには Entity Framework Core を用い、テストは MSTest ベースで記述します。
- C# コードでは `async`/`await` を用いた非同期処理を基本とし、ローカル変数には `var` を使用してください。
- ReadModel を直接編集せず、状態変更が必要な場合は Command・CommandHandler・Aggregate を通じて処理してください。
- Domain フォルダでは Aggregate クラスをモジュール直下に置き、`Commands` `Events` `Queries` の各サブフォルダを設ける構成を標準とします。例として `Domain/Dukascopy/DukascopyJobAggregate.cs` とその周辺に `Commands` `Events` `Queries` フォルダを配置します。
- Entity Framework の `DbContext` を直接扱わず、読み取りは `IQueryProcessor` を介したクエリハンドラー経由で行ってください。
- CommandHandler 内で ReadModel やデータベースを参照する処理は避け、Aggregate の状態のみを利用して判断してください。
- ReadModel の ID は基本的に `Guid` で保持します。EventFlow の `Identity` として利用する際はプレフィックス付きの文字列に変換されるため、
 その GUID を他のエンティティの ID として再利用しないよう注意してください。

## データベースマイグレーション

- API プロジェクトのマイグレーションは `api/Stratrack.Api/Domain/Migrations` フォルダに保存します。
- モデル変更時はリポジトリのルートディレクトリで次のコマンドを実行してマイグレーションを作成してください。
  - `dotnet ef migrations add <MigrationName> --project api/Stratrack.Api --startup-project api/Stratrack.Api`
- 必ず上記のコマンドでマイグレーションを生成し、ファイルを手動で編集しないでください。
- 生成したマイグレーションはリポジトリにコミットして共有します。
- `StratrackDesignTimeDbContextFactory` がデザイン時の DbContext を提供するため、特別な環境変数の設定は不要です。
  `dotnet ef migrations list --project api/Stratrack.Api --startup-project api/Stratrack.Api`
  を実行し、マイグレーションが正しく検出されることを確認してください。
- SQL Server を利用する環境では `StratrackDbContextProvider` が起動時に `Database.Migrate()` を自動実行します。インメモリ DB 使用時は `EnsureCreated()` となるためマイグレーションは適用されません。
