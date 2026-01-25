"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ComparisonResult {
  id: number;
  model_a: string;
  prompt_a: string;
  model_b: string;
  prompt_b: string;
  output_a: string;
  output_b: string;
  similarity_score: number | null;
  created_at: string;
  analysis?: {
    added_lines: number;
    removed_lines: number;
    changed_lines: number;
    total_changes: number;
  };
}

export default function Home() {
  const [modelA, setModelA] = useState("");
  const [promptA, setPromptA] = useState("");
  const [modelB, setModelB] = useState("");
  const [promptB, setPromptB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState("");
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);

  const handleCompare = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/comparisons/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_a: modelA,
          prompt_a: promptA,
          model_b: modelB,
          prompt_b: promptB,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      loadComparisons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadComparisons = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/comparisons/");
      if (response.ok) {
        const data = await response.json();
        setComparisons(data);
      }
    } catch (err) {
      console.error("Failed to load comparisons:", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">
          Model Change Inspector
        </h1>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
            Compare Models
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-zinc-700 dark:text-zinc-300">
                Model A
              </h3>
              <input
                type="text"
                placeholder="Model name (e.g., gpt-4)"
                value={modelA}
                onChange={(e) => setModelA(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md mb-3 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
              <textarea
                placeholder="Enter prompt for Model A"
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-zinc-700 dark:text-zinc-300">
                Model B
              </h3>
              <input
                type="text"
                placeholder="Model name (e.g., gpt-3.5-turbo)"
                value={modelB}
                onChange={(e) => setModelB(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md mb-3 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
              <textarea
                placeholder="Enter prompt for Model B"
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading || !modelA || !promptA || !modelB || !promptB}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            {loading ? "Comparing..." : "Compare Models"}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-md text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Comparison Results
            </h2>

            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <strong>Similarity Score:</strong>{" "}
                {result.similarity_score !== null
                  ? `${(result.similarity_score * 100).toFixed(2)}%`
                  : "N/A"}
              </p>
              {result.analysis && (
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <strong>Analysis:</strong> {result.analysis.total_changes}{" "}
                  total changes ({result.analysis.added_lines} added,{" "}
                  {result.analysis.removed_lines} removed,{" "}
                  {result.analysis.changed_lines} modified)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                  {result.model_a} Output
                </h3>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600">
                  <pre className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-50">
                    {result.output_a}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                  {result.model_b} Output
                </h3>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600">
                  <pre className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-50">
                    {result.output_b}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Recent Comparisons
            </h2>
            <button
              onClick={loadComparisons}
              className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-md transition-colors"
            >
              Refresh
            </button>
          </div>

          {comparisons.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              No comparisons yet.
            </p>
          ) : (
            <div className="space-y-4">
              {comparisons.map((comp) => (
                <div
                  key={comp.id}
                  className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {comp.model_a}
                      </span>
                      <span className="mx-2 text-zinc-400">vs</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {comp.model_b}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(comp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {comp.similarity_score !== null && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Similarity: {(comp.similarity_score * 100).toFixed(2)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
