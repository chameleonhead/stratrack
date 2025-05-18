const StrategyDetails = () => {
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">詳細</h2>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">戦略の詳細を入力してください</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">戦略名</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="戦略名を入力"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">説明</label>
            <textarea
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="戦略の説明を入力"
            ></textarea>
          </div>
          <button type="submit" className="mt-4 bg-primary text-primary-content py-2 px-4 rounded">
            作成
          </button>
        </form>
      </section>
    </div>
  );
};

export default StrategyDetails;
