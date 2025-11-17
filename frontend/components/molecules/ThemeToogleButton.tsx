import ToggleButton from "../atoms/ToggleButton";
import React, {useEffect, useState} from "react";
import {MoonIcon, SunIcon} from "../atoms/Icons";

enum Theme {
  LIGHT = "light",
  DARK = "dark"
}

const ThemeToogleButton: React.FC = () => {
  const [defaultTheme, setDefaultTheme] = useState<Theme | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const theme = e.target.checked ? Theme.LIGHT : Theme.DARK;
    setTheme(theme);
    localStorage.setItem("theme", e.target.checked ? Theme.LIGHT : Theme.DARK);
  };

  useEffect(() => {
      const storedTheme = localStorage.getItem("theme") as Theme | null;

      if (storedTheme) {
        setTheme(storedTheme);
      }

      if (defaultTheme === undefined && storedTheme === null) {
        const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = isDarkTheme() ? Theme.DARK : Theme.LIGHT;
        setDefaultTheme(theme);
        setTheme(theme);
        localStorage.setItem("theme", theme);
      }
      (document.querySelector("html") as HTMLElement).setAttribute("data-theme", theme);
    },
    [theme, defaultTheme]
  );

  return (
    <label className="flex cursor-pointer gap-2">
      <MoonIcon/>
      <ToggleButton label={"Toggle"} value={theme === Theme.LIGHT} onChange={handleToggle}/>
      <SunIcon/>
    </label>
  );
}

export default ThemeToogleButton;
