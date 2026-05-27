const { execSync, spawnSync } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 3000;

function killOnWindows(port) {
  try {
    // Use PowerShell to get owning process IDs for the port
    const psCmd = `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`;
    const result = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psCmd], { encoding: 'utf8' });
    if (result.error) throw result.error;
    const out = result.stdout || '';
    const pids = Array.from(new Set(out.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
    if (pids.length === 0) {
      console.log(`No process on port ${port}`);
      return;
    }
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGKILL');
        console.log(`Killed process ${pid} listening on port ${port}`);
      } catch (err) {
        try {
          // Fallback to taskkill
          execSync(`taskkill /PID ${pid} /F`);
          console.log(`Taskkill killed ${pid}`);
        } catch (e) {
          console.warn(`Failed to kill ${pid}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.warn('Error killing port on Windows:', err.message);
  }
}

function killOnUnix(port) {
  try {
    // lsof may not be available; try netstat as fallback
    let stdout = '';
    try {
      stdout = execSync(`lsof -i :${port} -t 2>/dev/null`).toString();
    } catch (e) {
      try {
        stdout = execSync(`ss -ltnp 2>/dev/null | grep :${port} | awk '{print $6}' | sed 's/.*pid=\\?\([0-9]*\).*/\\1/'`).toString();
      } catch (e2) {
        stdout = '';
      }
    }
    const pids = Array.from(new Set(stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
    if (pids.length === 0) {
      console.log(`No process on port ${port}`);
      return;
    }
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGKILL');
        console.log(`Killed process ${pid} listening on port ${port}`);
      } catch (err) {
        console.warn(`Failed to kill pid ${pid}: ${err.message}`);
      }
    }
  } catch (err) {
    console.warn('Error killing port on Unix:', err.message);
  }
}

if (os.platform() === 'win32') {
  killOnWindows(PORT);
} else {
  killOnUnix(PORT);
}
