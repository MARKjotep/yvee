export function waitForStylesheets(links: HTMLLinkElement[]) {
  const pending = new Set<() => void>();
  const ready = Promise.all(links.map((link) => new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      pending.delete(finish);
      window.clearTimeout(timeout);
      link.removeEventListener("load", finish);
      link.removeEventListener("error", finish);
      resolve();
    };

    const timeout = window.setTimeout(finish, 8000);
    pending.add(finish);
    link.addEventListener("load", finish, { once: true });
    link.addEventListener("error", finish, { once: true });
  }))).then(() => undefined);

  return {
    ready,
    cancel() {
      for (const finish of [...pending]) finish();
    },
  };
}
