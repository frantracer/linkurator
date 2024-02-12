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
    if (e.target.checked) {
      setTheme(Theme.LIGHT);
    } else {
      setTheme(Theme.DARK);
    }
  };

  useEffect(() => {
      if (defaultTheme === undefined) {
        const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = isDarkTheme() ? Theme.DARK : Theme.LIGHT;
        setDefaultTheme(theme);
        setTheme(theme);
      }
      (document.querySelector("html") as HTMLElement).setAttribute("data-theme", theme);
    },
    [theme, defaultTheme]
  );

  return (
    <label className="flex cursor-pointer gap-2 m-auto">
      <MoonIcon/>
      <ToggleButton label={"Toggle"} value={theme === Theme.LIGHT} onChange={handleToggle}/>
      <SunIcon/>
    </label>
  );
}

export default ThemeToogleButton;
