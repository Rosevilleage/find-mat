import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconX, IconTrash } from "@tabler/icons-react";
import { useFoodList } from "../model/useFoodList";
import { FoodListInput } from "./FoodListInput";
import { FoodChips } from "./FoodChips";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/shared/ui/kit/alert-dialog";

interface FoodListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export function FoodListModal({
  isOpen,
  onClose,
  onShowToast,
}: FoodListModalProps) {
  const { foods, addFood, removeFood, clearAll } = useFoodList();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleAdd = (food: string) => {
    const result = addFood(food);
    if (onShowToast) {
      if (result.success) {
        onShowToast("음식이 추가되었습니다", "success");
      } else {
        onShowToast(result.error || "추가 실패", "error");
      }
    }
  };

  const handleRemove = (index: number) => {
    removeFood(index);
    if (onShowToast) {
      onShowToast("음식이 삭제되었습니다", "success");
    }
  };

  const handleClearAll = () => {
    if (foods.length > 0) {
      setIsAlertOpen(true);
    }
  };

  const handleConfirmClearAll = () => {
    clearAll();
    setIsAlertOpen(false);
    if (onShowToast) {
      onShowToast("모든 음식이 삭제되었습니다", "success");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Sheet - iOS style */}
      <motion.div
        className="relative w-full tablet:max-w-tablet bg-white rounded-t-[32px] overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
        initial={{ y: 500, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 500, opacity: 0 }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 350,
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">내 음식 목록</h2>
              <p className="text-sm text-muted-foreground mt-1">
                자주 먹는 음식을 추가해보세요 ({foods.length}/50)
              </p>
            </div>
            {foods.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="모두 삭제"
              >
                <IconTrash size={20} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Input Section */}
          <div className="mb-4">
            <FoodListInput onAdd={handleAdd} />
          </div>

          {/* Food Chips Display */}
          <div className="min-h-[200px]">
            <FoodChips foods={foods} onRemove={handleRemove} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl transition-all duration-150 active:scale-[0.98] shadow-md cursor-pointer font-medium"
          >
            완료
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-150 cursor-pointer"
          aria-label="닫기"
        >
          <IconX className="w-5 h-5 text-gray-500" />
        </button>
      </motion.div>

      {/* Clear All Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모든 음식 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 모든 음식을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearAll}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
