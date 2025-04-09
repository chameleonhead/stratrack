import NumberInput from "../../components/NumberInput";

function PositionManagement() {
  return (
    <section id="position-management" className="space-y-4">
      <h2>保有中戦略</h2>
      <NumberInput label="テイクプロフィット（%）" name="position.tp" />
      <NumberInput label="ストップロス（%）" name="position.sl" />
      <NumberInput
        label="トレーリングストップ（pips）"
        name="position.trailing_stop"
      />
    </section>
  );
}

export default PositionManagement;
