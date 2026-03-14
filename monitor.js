const { SerialPort } = require("serialport");

const portName = process.argv[2] || "COM4";
const baudRate = parseInt(process.argv[3]) || 115200;

console.log(`--- Connecting to ${portName} at ${baudRate} baud ---`);
console.log(`--- Press Ctrl+C to exit ---\n`);

const port = new SerialPort({
  path: portName,
  baudRate: baudRate,
});

// Use the UTF-8 encoding for the data
port.on("data", (data) => {
  process.stdout.write(data.toString("utf8"));
});

port.on("open", () => {
  console.log(`[CONNECTED]\n`);
});

port.on("error", (err) => {
  console.error(`\n[ERROR]: ${err.message}`);
  if (err.message.includes("Access is denied")) {
    console.error(
      `TIP: Another program is likely using ${portName}. Check other terminals, VS Code extensions, or unplug and re-plug the Pico.`,
    );
  }
  process.exit(1);
});

port.on("close", () => {
  console.log(`\n[DISCONNECTED]`);
});
