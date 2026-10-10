/* exported probe, drawProbe, scheduleProbe */
// Trusted harness probe, never a player-data execution path.
let probe = { count: 0 };
// Exercise random ordering and an explicit node supplied by the case.
const drawProbe = () => {
  probe = { ...probe, count: probe.count + 1 };
  document.querySelector("#probe").textContent = String(Math.random());
  return Math.random();
};
// Exercise timer teardown without involving the host event loop.
const scheduleProbe = () =>
  setInterval(
    // A retained repeating callback exposes missing timer cleanup to the harness test.
    () => {
      probe.count++;
    },
    10,
  );
