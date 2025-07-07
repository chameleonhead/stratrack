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
