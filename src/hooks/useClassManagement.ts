import { useState, useCallback, useEffect } from "react";
import {
  applyTailwindStyle,
  identifyTailwindClasses,
  refreshTailwind,
  removeTailwindStyle,
  searchTailwindClasses,
} from "@/utils/tailwindUtils";

export const useClassManagement = (
  element: HTMLElement,
  onClassChange: () => void
) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    { c: string; p: string }[]
  >([]);

  useEffect(() => {
    setClasses(identifyTailwindClasses(element));
  }, [element]);

  useEffect(() => {
    if (query.trim() === "") {
      setAutocompleteResults([]);
    } else {
      const matches = searchTailwindClasses(query);
      setAutocompleteResults(matches);
    }
  }, [query]);

  const handleAddClass = useCallback(
    (newClass: string | null) => {
      if (!newClass) return;
      const trimmedClass = newClass.trim();
      if (trimmedClass === "") return;

      applyTailwindStyle(element, trimmedClass);
      setClasses((prevClasses) => {
        if (!prevClasses.includes(trimmedClass)) {
          return [...prevClasses, trimmedClass];
        }
        return prevClasses;
      });
      onClassChange();

      setQuery("");
    },
    [element, onClassChange]
  );

  const handleRemoveClass = useCallback(
    (classToRemove: string) => {
      element.classList.remove(classToRemove);
      removeTailwindStyle(element, classToRemove);
      setClasses((classes) => classes.filter((c) => c !== classToRemove));
      onClassChange();
      refreshTailwind();
    },
    [element, onClassChange]
  );

  const handleClassToggle = useCallback(
    (className: string, isChecked: boolean) => {
      if (isChecked) {
        applyTailwindStyle(element, className);
      } else {
        removeTailwindStyle(element, className);
      }
      onClassChange();
      refreshTailwind();
    },
    [element, onClassChange]
  );

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    const matches = searchTailwindClasses(value);
    setAutocompleteResults(matches);
  }, []);

  return {
    classes,
    query,
    autocompleteResults,
    handleAddClass,
    handleRemoveClass,
    handleClassToggle,
    handleInputChange,
  };
};
