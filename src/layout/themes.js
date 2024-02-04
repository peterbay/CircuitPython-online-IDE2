import themes from "./themes.json";

const getThemeClassByLabel = (label) => {
    const selectedTheme = themes.themes.find((theme) => theme.label === label);
    return selectedTheme ? selectedTheme.class : "light";
};

const getThemeNameByLabel = (label) => {
    const selectedTheme = themes.themes.find((theme) => theme.label === label);
    return selectedTheme ? selectedTheme.name : "tomorrow";
};

const getThemeTypeByLabel = (label) => {
    const selectedTheme = themes.themes.find((theme) => theme.label === label);
    return selectedTheme ? selectedTheme.type : "light";
};

const getThemesNamesList = () => {
    return themes.themes.map((theme) => theme.label);
};

const getDefaultTheme = () => {
    return themes.default_theme;
};

export {
    themes,
    getThemeClassByLabel,
    getThemeNameByLabel,
    getThemeTypeByLabel,
    getThemesNamesList,
    getDefaultTheme,
};
