import { useState, useEffect } from "react";

// Hook này nhận một giá trị (value) và thời gian trễ (delay)
export function useDebounce<T>(value: T, delay: number): T {
  // State để lưu giá trị đã trễ
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Chỉ cập nhật state sau khi hết thời gian trễ
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy timeout nếu value thay đổi (tránh chạy nhiều lần)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
