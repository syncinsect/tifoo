import type { ComputedStyles } from "@/types"

export function getElementStyles(element: HTMLElement): ComputedStyles {
  const styles = window.getComputedStyle(element)
  const getIntValue = (prop: string) =>
    parseInt(styles.getPropertyValue(prop), 10)
  return {
    padding: {
      top: getIntValue("padding-top"),
      right: getIntValue("padding-right"),
      bottom: getIntValue("padding-bottom"),
      left: getIntValue("padding-left")
    },
    margin: {
      top: getIntValue("margin-top"),
      right: getIntValue("margin-right"),
      bottom: getIntValue("margin-bottom"),
      left: getIntValue("margin-left")
    }
  }
}
