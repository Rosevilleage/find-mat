import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/shared/ui/kit/input-group";

interface FoodListInputProps {
  onAdd: (food: string) => void;
}

export function FoodListInput({ onAdd }: FoodListInputProps) {
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value);
      setValue("");
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <InputGroup>
      <InputGroupInput
        placeholder="음식 이름 입력 (예: 김치찌개, 피자)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        autoFocus
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={handleSubmit} aria-label="음식 추가">
          <IconPlus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
