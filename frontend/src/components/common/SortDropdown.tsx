// src/components/common/SortDropdown.tsx (Frontend)

"use client";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";

// Định nghĩa kiểu cho các lựa chọn
export interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  label: string;
  options: SortOption[];
  value: SortOption; // Giá trị đang được chọn
  onChange: (value: SortOption) => void;
}

export default function SortDropdown({
  label,
  options,
  value,
  onChange,
}: SortDropdownProps) {
  return (
    <div className="text-left">
      <Menu as="div" className="relative inline-block">
        <div>
          {/* Nút bấm hiển thị giá trị hiện tại */}
          <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            {label}: {value.label}
            <ChevronDownIcon
              className="w-5 h-5 ml-2 -mr-1 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          {/* Danh sách các lựa chọn */}
          <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
            <div className="py-1">
              {options.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => onChange(option)}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } ${
                        value.value === option.value
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-gray-200"
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      {option.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
