const os = require("os");
const isLocal = () => os.hostname() === "mimabagelingMAC.local";

export { isLocal };
export default isLocal;
