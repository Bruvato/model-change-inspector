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
      const response = await fetch("http://127.0.0.1:8000/api/comparisons/");
      if (response.ok) {
        const data = await response.json();
        setComparisons(data);
      }
    } catch (err) {
      console.error("Failed to load comparisons:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Model Change Inspector
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Compare Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">
                  Model A
                </h3>
                <Input
                  type="text"
                  placeholder="Model name (e.g., gpt-4)"
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  className="mb-3"
                />
                <Textarea
                  placeholder="Enter prompt for Model A"
                  value={promptA}
                  onChange={(e) => setPromptA(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">
                  Model B
                </h3>
                <Input
                  type="text"
                  placeholder="Model name (e.g., gpt-3.5-turbo)"
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  className="mb-3"
                />
                <Textarea
                  placeholder="Enter prompt for Model B"
                  value={promptB}
                  onChange={(e) => setPromptB(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <Button
              onClick={handleCompare}
              disabled={loading || !modelA || !promptA || !modelB || !promptB}
              className="mt-6 w-full"
              size="lg"
            >
              {loading ? "Comparing..." : "Compare Models"}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Comparison Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Similarity Score:</strong>{" "}
                  {result.similarity_score !== null
                    ? `${(result.similarity_score * 100).toFixed(2)}%`
                    : "N/A"}
                </p>
                {result.analysis && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Analysis:</strong> {result.analysis.total_changes}{" "}
                    total changes ({result.analysis.added_lines} added,{" "}
                    {result.analysis.removed_lines} removed,{" "}
                    {result.analysis.changed_lines} modified)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">
                    {result.model_a} Output
                  </h3>
                  <div className="p-4 bg-muted rounded-md border border-border">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                      {result.output_a}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">
                    {result.model_b} Output
                  </h3>
                  <div className="p-4 bg-muted rounded-md border border-border">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                      {result.output_b}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Comparisons</CardTitle>
            <Button onClick={loadComparisons} variant="outline" size="sm">
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {comparisons.length === 0 ? (
              <p className="text-muted-foreground">No comparisons yet.</p>
            ) : (
              <div className="space-y-4">
                {comparisons.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 border border-border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{comp.model_a}</Badge>
                        <span className="text-muted-foreground">vs</span>
                        <Badge variant="outline">{comp.model_b}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {comp.similarity_score !== null && (
                      <p className="text-sm text-muted-foreground">
                        Similarity: {(comp.similarity_score * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
