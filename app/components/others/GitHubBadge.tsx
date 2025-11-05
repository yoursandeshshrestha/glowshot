"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export function GitHubBadge() {
  const [stars, setStars] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStars() {
      try {
        const response = await fetch(
          "https://api.github.com/repos/yoursandeshshrestha/glowshot",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          if (mounted) {
            setStars(0);
            setIsLoading(false);
          }
          return;
        }

        const data = await response.json();
        if (mounted) {
          setStars(data.stargazers_count || 0);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
        if (mounted) {
          setStars(0);
          setIsLoading(false);
        }
      }
    }

    fetchStars();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex items-center">
      <a
        href="https://github.com/yoursandeshshrestha/Glowshot"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 transition-colors"
      >
        <Star className="w-3.5 h-3.5" />
        <span>Star</span>
      </a>
      <a
        href="https://github.com/yoursandeshshrestha/Glowshot/stargazers"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1 text-xs font-medium border border-l-0 border-gray-300 rounded-r-md bg-white hover:bg-gray-50 transition-colors"
      >
        {isLoading ? "..." : stars}
      </a>
    </div>
  );
}
