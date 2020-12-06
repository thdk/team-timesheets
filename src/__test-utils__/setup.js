const noop = () => {};
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

// Environment variables
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
