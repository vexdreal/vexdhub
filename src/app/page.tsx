export default function Home() {
  return (
    <main>
      <div className="login-card">
        <h1>VexdHub</h1>

        <p>Premium Key System Platform</p>

        <input 
          type="text" 
          placeholder="Username"
        />

        <input 
          type="password" 
          placeholder="Password"
        />

        <button>
          Login
        </button>
      </div>
    </main>
  );
}