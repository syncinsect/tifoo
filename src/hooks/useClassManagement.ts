import { useState, useCallback, useEffect } from "react";
import {
  applyTailwindStyle,
  identifyTailwindClasses,
  refreshTailwind,
  removeTailwindStyle,
  searchTailwindClasses,
} from "@/utils";

export const useClassManagement = (
  element: HTMLElement | null,
  onClassChange: () => void
) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    { c: string; p: string }[]
  >([]);

  useEffect(() => {
    if (element) {
      setClasses(identifyTailwindClasses(element));
    } else {
      setClasses([]);
    }
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
      if (!newClass || !element) return;
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
      if (!element) return;
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
      if (!element) return;

      const currentClasses = element.className.split(" ").filter(Boolean);

      if (isChecked) {
        if (!currentClasses.includes(className)) {
          currentClasses.push(className);
        }
      } else {
        const index = currentClasses.indexOf(className);
        if (index !== -1) {
          currentClasses.splice(index, 1);
        }
      }

      element.className = currentClasses.join(" ");

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

  const resetClassManagement = useCallback(() => {
    setClasses([]);
    setQuery("");
    setAutocompleteResults([]);
  }, []);

  return {
    classes,
    query,
    autocompleteResults,
    handleAddClass,
    handleRemoveClass,
    handleClassToggle,
    handleInputChange,
    resetClassManagement,
  };
};
