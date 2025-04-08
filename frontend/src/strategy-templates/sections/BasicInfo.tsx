import Input from "../../components/Input";
import TagInput from "../../components/TagInput";
import Textarea from "../../components/Textarea";

function BasicInfo() {
  return (
      <section id="basic-info" className="space-y-4">
        <h2>基本情報</h2>
        <Input label="戦略名" name="name" required />
        <Textarea label="説明" name="description" rows={3} />
        <TagInput label="タグ" name="tags" />
      </section>

  );
}

export default BasicInfo;
