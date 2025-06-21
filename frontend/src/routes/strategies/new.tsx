import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStrategy } from "../../api/strategies";

const NewStrategy = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createStrategy({
      name,
      description,
      template: {},
    });
    navigate("/strategies");
  };
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">戦略新規作成</h2>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">戦略の詳細を入力してください</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">戦略名</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="戦略名を入力"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">説明</label>
            <textarea
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="戦略の説明を入力"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

export default NewStrategy;
