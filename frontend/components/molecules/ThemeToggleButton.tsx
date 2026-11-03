import ToggleButton from "../atoms/ToggleButton";
import React, {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {MoonIcon, SunIcon} from "../atoms/Icons";
import {setUserTheme} from "../../utilities/theme";
import {Theme} from "../../utilities/themeConfig";

type ThemeToggleButtonProps = {
  onThemeChange?: (theme: Theme) => void;
}

const ThemeToggleButton = ({onThemeChange}: ThemeToggleButtonProps) => {
  const t = useTranslations("common");
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  useEffect(() => {
    const htmlElement = document.querySelector("html") as HTMLElement;
    const currentTheme = htmlElement.getAttribute("data-theme") as Theme;
    setTheme(currentTheme || Theme.DARK);
  }, []);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = e.target.checked ? Theme.LIGHT : Theme.DARK;
    await setUserTheme(newTheme);
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  return (
    <label className="flex cursor-pointer gap-2">
      <MoonIcon/>
      <ToggleButton label={theme === Theme.LIGHT ? t("light_theme") : t("dark_theme")} value={theme === Theme.LIGHT} onChange={handleToggle}/>
      <SunIcon/>
    </label>
  );
}

export default ThemeToggleButton;
