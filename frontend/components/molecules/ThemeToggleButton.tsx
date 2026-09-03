import ToggleButton from "../atoms/ToggleButton";
import React, {useEffect, useState} from "react";
import {MoonIcon, SunIcon} from "../atoms/Icons";
import {setUserTheme} from "../../utilities/theme";
import {Theme} from "../../utilities/themeConfig";

const ThemeToggleButton: React.FC = () => {
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
  };

  return (
    <label className="flex cursor-pointer gap-2">
      <MoonIcon/>
      <ToggleButton label={"Toggle"} value={theme === Theme.LIGHT} onChange={handleToggle}/>
      <SunIcon/>
    </label>
  );
}

export default ThemeToggleButton;
