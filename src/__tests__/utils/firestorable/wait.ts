export const waitAsync = (timeout: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
};