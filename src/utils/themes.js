import themes from '../settings/themesSettings';

const getThemeClassByLabel = (label) => {
    const selectedTheme = themes.themes.find((theme) => theme.label === label);
    return selectedTheme ? selectedTheme.class : 'light';
};

const getThemeNameByLabel = (label) => {
    const selectedTheme = themes.themes.find((theme) => theme.label === label);
    return selectedTheme ? selectedTheme.name : 'tomorrow';
};

const getThemeTypeByLabel = (label) => {
    const selectedTheme = themes.themes.find((theme) => theme.label === label);
    return selectedTheme ? selectedTheme.type : 'light';
};

const getThemesNamesList = () => {
    return themes.themes.map((theme) => theme.label);
};

const getDefaultTheme = () => {
    const selectedTheme = themes.themes.find((theme) => theme.name === themes.default_theme);
    return selectedTheme ? selectedTheme.label : null;
};

const getSystemTheme = (isDark) => {
    const themeName = isDark ? themes.default_dark_theme : themes.default_light_theme;
    const selectedTheme = themes.themes.find((theme) => theme.name === themeName);
    return selectedTheme ? selectedTheme.label : 'light';
};

export { themes, getThemeClassByLabel, getThemeNameByLabel, getThemeTypeByLabel, getThemesNamesList, getDefaultTheme, getSystemTheme };
