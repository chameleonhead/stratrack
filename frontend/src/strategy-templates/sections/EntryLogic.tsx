import ConditionBuilder from "../components/ConditionBuilder";

function EntryLogic() {
  return (
    <section id="entry-logic" className="space-y-4">
      <div>
        <h2>エントリー条件</h2>
        <p className="text-gray-500 text-sm">
          エントリー条件は、戦略がエントリーするための条件を定義します。複数の条件を組み合わせて設定できます。
        </p>
      </div>
      <div>
        <h3>買い条件</h3>
        <ConditionBuilder name="entry.long.condition" />
      </div>
      <div>
        <h3>売り条件</h3>
        <ConditionBuilder name="entry.short.condition" />
      </div>
    </section>
  );
}

export default EntryLogic;
