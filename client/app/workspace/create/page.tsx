"use client";

import { useState } from "react";
import { createWorkspace } from "@/features/workspace/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Users } from "lucide-react";
import Link from "next/link";

export default function CreateWorkspacePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createWorkspace(name); // You can extend the API later to accept description if needed
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create workspace");
      alert("Failed to create workspace. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-violet-600 rounded-3xl flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-semibold text-gray-900">Create Workspace</h1>
            <p className="text-gray-600 mt-3 max-w-sm">
              Workspaces are shared environments where you and your team can collaborate on projects.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Workspace Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp, Marketing Team, Startup"
                className="w-full px-5 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-gray-50 placeholder:text-gray-400"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Choose a clear, recognizable name for your team or company
              </p>
            </div>

            {/* Optional Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for? (e.g. Main company workspace, Design team, etc.)"
                rows={4}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-gray-50 resize-y min-h-[120px]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.985]"
            >
              {isLoading ? (
                "Creating Workspace..."
              ) : (
                <>
                  Create Workspace
                  <Users size={22} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-8">
            You will be the owner and admin of this workspace
          </p>
        </div>
      </div>
    </div>
  );
}