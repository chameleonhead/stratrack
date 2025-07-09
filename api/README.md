# 準備

1. Azure Functions Core Tools のインストール
2. `cd Stratrack.Api` を実行する
3. 以下を参考に `local.settings.json` を作成する
3. `func start` を実行する
4. http://localhost:7071/api/swagger/ui にアクセスする


## local.settings.json (InMemory)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "AzureWebJobsDashboard": "UseDevelopmentStorage=true"
  }
}
```

## local.settings.json (SQL Server Express LocalDB)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "AzureWebJobsDashboard": "UseDevelopmentStorage=true"
  },
  "ConnectionStrings": {
    "SqlConnectionString": "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=StratrackDb;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False"
  }
}
```

## Durable Functions のローカル検証

Azurite と Azure Functions Core Tools を利用することで、Durable Functions のオーケストレーションをローカルで確認できます。

1. 別ターミナルで `azurite` を実行し、ストレージエミュレーターを起動します。Docker を使用する場合は `docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite` を実行します。
2. `Stratrack.Api` ディレクトリで `func start` を実行し Functions ホストを起動します。
3. `http://localhost:7071/api/swagger/ui` から `CreateDukascopyJob` などのエンドポイントを呼び出し、`StartDukascopyJob` を実行すると `DukascopyJobOrchestrator` が起動してジョブが開始されます。
4. オーケストレーターの状態は `func durable get-instances` で確認できます。
5. ジョブの実行状況や直近のエラーは `GetDukascopyJobStatus` で取得できます。
