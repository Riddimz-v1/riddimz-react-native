export const measureLatency = async (url: string) => {
    const start = Date.now();
    try {
        await fetch(url);
        return Date.now() - start;
    } catch (e) {
        return -1;
    }
};
