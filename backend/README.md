# セットアップ手順


## Pyenv のインストール

以下のコマンドを実行し、Pyenv をインストールする。(Windows の場合は miniconda 等を使うのが良い。)

```
curl https://pyenv.run | bash
```

インストール後、以下を .bashrc / .zshrc に追加する。

```
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv virtualenv-init -)"
```

シェルの設定を反映する。

```
exec "$SHELL"
```

Python 3.11 をインストールし、ローカルへ設定する。

```
pyenv install 3.11.8
pyenv local 3.11.8
```

## Poetry のインストール

以下のコマンドを実行し、poetry をインストールする。

```
curl -sSL https://install.python-poetry.org | python3 -
```

インストール後、以下を .bashrc / .zshrc に追加する。

```
export PATH="$HOME/.local/bin:$PATH"
```

シェルの設定を反映する。

```
exec "$SHELL"
```

# アプリの実行

以下のコマンドを実行し、アプリを起動する。

```
poetry run uvicorn app.main:app --reload
```

フォーマットは以下のコマンドで実行する。

```
poetry run black .
poetry run isort .
```

静的解析は以下のコマンドで実行する。

```
poetry run ruff check
poetry run mypy .
```

単体テストは以下のコマンドで実行する。

```
poetry run pytest
```
