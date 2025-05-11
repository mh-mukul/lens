import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-24 flex justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8">Login</h1>
        <p className="text-muted-foreground mb-8">Sign in to manage your photography portfolio.</p>
        <LoginForm />
      </div>
    </div>
  )
}
