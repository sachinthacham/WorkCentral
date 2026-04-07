export default function HomePage(){

  return(

    <div className="text-center mt-20">

      <h1 className="text-4xl font-bold mb-4">
        Workspace Management Platform
      </h1>

      <p className="text-gray-500 mb-8">
        Manage projects, tasks and teams
      </p>

      <div className="flex justify-center gap-4">

        <a
          href="/register"
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          Get Started
        </a>

        <a
          href="/login"
          className="border px-6 py-2 rounded"
        >
          Login
        </a>

      </div>

    </div>
  )
}