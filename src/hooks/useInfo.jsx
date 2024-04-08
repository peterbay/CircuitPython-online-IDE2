import { enqueueSnackbar } from 'notistack'

export default function useInfo() {

    const addMessage = function (message) {
        enqueueSnackbar(message.message, { variant: message.variant || 'default' });
    };

    const errorMessage = function (message) {
        enqueueSnackbar(message, { variant: 'error' });
    };

    const successMessage = function (message) {
        enqueueSnackbar(message, { variant: 'success' });
    };

    const infoMessage = function (message) {
        enqueueSnackbar(message, { variant: 'info' });
    };

    const warningMessage = function (message) {
        enqueueSnackbar(message, { variant: 'warning' });
    };

    return {
        addMessage,
        errorMessage,
        successMessage,
        infoMessage,
        warningMessage,
    };
}
