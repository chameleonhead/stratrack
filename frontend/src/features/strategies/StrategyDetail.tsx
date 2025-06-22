import { Link } from "react-router-dom";
import CodeEditor from "../../components/CodeEditor";
import type { StrategyDetail as StrategyDetailType } from "../../api/strategies";

export type StrategyDetailProps = {
  strategy: StrategyDetailType;
};

export default function StrategyDetail({ strategy }: StrategyDetailProps) {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{strategy.name}</h2>
        <Link to={`/strategies/${strategy.id}/edit`} className="btn btn-sm btn-primary">
          編集
        </Link>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">説明</h3>
        <p className="whitespace-pre-wrap">{strategy.description ?? "(なし)"}</p>
        {strategy.tags.length > 0 && (
          <p className="mt-2 space-x-2">
            {strategy.tags.map((t) => (
              <span key={t} className="badge badge-neutral">
                {t}
              </span>
            ))}
          </p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">テンプレート</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
          {JSON.stringify(strategy.template, null, 2)}
        </pre>
      </section>

      {strategy.generatedCode && (
        <section>
          <h3 className="text-lg font-semibold mb-2">変換コード</h3>
          <CodeEditor language="python" value={strategy.generatedCode} readOnly />
        </section>
      )}
    </div>
  );
}
