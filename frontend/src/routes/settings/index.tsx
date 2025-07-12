import { Link } from "react-router-dom";
import Button from "../../components/Button";
import { resetDatabase } from "../../api/maintenance";

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">設定</h2>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">管理メニュー</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4 shadow">
            <h4 className="font-bold">Dukascopyジョブ管理</h4>
            <p className="text-sm text-gray-600">通貨ペアごとの抽出ジョブを管理します</p>
            <Link
              to="/settings/dukascopy-jobs"
              className="mt-2 bg-primary text-primary-content py-1 px-3 rounded"
            >
              開く
            </Link>
          </div>
          <div className="rounded-xl border p-4 shadow">
            <h4 className="font-bold">Dukascopyログ</h4>
            <p className="text-sm text-gray-600">ジョブの実行履歴を確認します</p>
            <Link
              to="/settings/dukascopy-logs"
              className="mt-2 bg-primary text-primary-content py-1 px-3 rounded"
            >
              開く
            </Link>
          </div>
          <div className="rounded-xl border p-4 shadow">
            <h4 className="font-bold">データベースリセット</h4>
            <p className="text-sm text-gray-600">開発用データベースを初期化します</p>
            <Button
              className="mt-2"
              onClick={async () => {
                if (!confirm("本当にリセットしますか？")) {
                  return;
                }
                await resetDatabase();
                alert("リセットしました");
              }}
            >
              実行
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
