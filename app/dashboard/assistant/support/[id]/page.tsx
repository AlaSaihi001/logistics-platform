"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Using useParams to retrieve dynamic parameters
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Claim {
  id: number;
  sujet: string;
  description: string;
  date: string;
  status: string;
  documents: { name: string; url: string }[]; // Format des documents
  client: { nom: string; prenom: string }; // Ensure client details are available
}

export default function ClaimDetailPage() {
  const { id } = useParams(); // Get the dynamic ID from the query params
  const { toast } = useToast();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/reclamations/${id}`);
        if (!response.ok) {
          throw new Error("Error fetching claim");
        }

        const data = await response.json();
        setClaim(data);
      } catch (error) {
        console.error("Error fetching claim:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la réclamation",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id, toast]);

  const handleResolveClaim = async () => {
    if (!claim) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/reclamations/${claim.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Résolu" }),
      });

      if (response.ok) {
        toast({
          title: "Réclamation résolue",
          description: "La réclamation a été marquée comme résolue.",
        });
        setClaim({ ...claim, status: "Résolu" }); // Update status locally
      } else {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error resolving claim:", error);
      toast({
        title: "Erreur",
        description: "Impossible de résoudre la réclamation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!claim || !claim.client) {
    return (
      <div className="text-center py-4">
        <h2>Réclamation non trouvée</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Détails de la réclamation</CardTitle>
          <CardDescription>
            Information détaillée sur la réclamation de {claim.client.nom}{" "}
            {claim.client.prenom}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex gap-4 mb-4">
              <p>
                <strong>Sujet: </strong>
                {claim.sujet}
              </p>
            </div>
            <div className="flex gap-4 mb-4">
              <p>
                <strong>Description: </strong>
                {claim.description}
              </p>
            </div>
            <div className="flex gap-4 mb-4">
              <p>
                <strong>Date de création: </strong>
                {claim.date}
              </p>
            </div>
            <div className="flex gap-4 mb-4">
              <p>
                <strong>Status: </strong>
                <StatusBadge status={claim.status} />
              </p>
            </div>
            <div className="flex gap-4 mb-4">
              <p>
                <strong>Documents: </strong>
              </p>
              {Array.isArray(claim.documents) && claim.documents.length > 0 ? (
                <ul>
                  {claim.documents.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : typeof claim.documents === "string" &&
                claim.documents.trim() === "" ? (
                <p>No documents to show</p>
              ) : (
                // Optional: handle other cases if documents is an object but not an array
                <p>No documents to show</p>
              )}
            </div>

            {claim.status !== "Résolu" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleResolveClaim}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Résoudre la réclamation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
