import { useState, useCallback, useEffect } from "react";
import {
  applyTailwindStyle,
  identifyTailwindClasses,
  refreshTailwind,
  removeTailwindStyle,
  searchTailwindClasses,
} from "@/utils";

interface ClassItem {
  name: string;
  active: boolean;
}

export const useClassManagement = (
  element: HTMLElement | null,
  onClassChange: () => void
) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [query, setQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    { c: string; p: string }[]
  >([]);

  useEffect(() => {
    if (element) {
      const identifiedClasses = identifyTailwindClasses(element);
      const classItems = identifiedClasses.map((cls) => ({
        name: cls,
        active: element.classList.contains(cls),
      }));
      setClasses(classItems);
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
        if (!prevClasses.some((cls) => cls.name === trimmedClass)) {
          return [...prevClasses, { name: trimmedClass, active: true }];
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
      setClasses((classes) => classes.filter((c) => c.name !== classToRemove));
      onClassChange();
      refreshTailwind();
    },
    [element, onClassChange]
  );

  const handleClassToggle = useCallback(
    (className: string, isChecked: boolean) => {
      if (!element) return;

      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.name === className ? { ...cls, active: isChecked } : cls
        )
      );

      if (isChecked) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
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
