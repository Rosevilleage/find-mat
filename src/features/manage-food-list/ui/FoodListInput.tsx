import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/shared/ui/kit";

interface FoodListInputProps {
  onAdd: (food: string) => void;
}

export function FoodListInput({ onAdd }: FoodListInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
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
