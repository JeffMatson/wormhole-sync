import cliProgress from "cli-progress";

const dotOrgPluginFetchProgressBar = new cliProgress.SingleBar(
  {
    clearOnComplete: true,
    hideCursor: true,
    format: "Plugins: {bar} | {percentage}% | {value}/{total}",
  },
  cliProgress.Presets.shades_grey
);

const queueProgressBar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format:
      "{title}: {bar} | Active: {active} | Pending: {pending} | Completed: {completed}",
  },
  cliProgress.Presets.shades_grey
);

export { queueProgressBar, dotOrgPluginFetchProgressBar };
