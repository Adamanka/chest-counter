function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-ink-200 bg-white/70 px-4 py-3 backdrop-blur dark:border-ink-800 dark:bg-ink-900/70">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-8 w-8" />
          <span className="text-lg font-bold">Chest Counter</span>
          <span className="muted text-sm">bootstrap</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold">Project bootstrap</h1>
        <p className="muted mt-2">
          Tooling is in place. Features are implemented in stage 2.
        </p>
      </main>
      <footer className="border-t border-ink-200 px-4 py-6 text-center text-sm dark:border-ink-800">
        <p className="muted">
          Unofficial fan project, not affiliated with Epic Games
        </p>
      </footer>
    </div>
  )
}

export default App
