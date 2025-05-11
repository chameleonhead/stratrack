# 環境構築手順

[Bicep CLI](https://learn.microsoft.com/ja-jp/azure/azure-resource-manager/bicep/install#azure-cli) を利用して以下のコマンドを実行する。

```zsh
az group create --name stratrack-dev --location japaneast
az deployment group create --resource-group stratrack-dev --template-file infrastructure/main.bicep --parameters infrastructure/dev.bicepparam
```
