"use client";

import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";
import type {
  PublicContributionDraft,
  PublicContributionDraftInput,
  PublicContributionReceipt,
  PublicContributionSubmitInput
} from "@todo/types";

export function useContributionDraft() {
  return useMutation({
    mutationFn: (input: PublicContributionDraftInput) =>
      apiRequest<PublicContributionDraft>("/contributions/draft", {
        method: "POST",
        body: JSON.stringify(input)
      })
  });
}

export function useContributionSubmit() {
  return useMutation({
    mutationFn: (input: PublicContributionSubmitInput) =>
      apiRequest<PublicContributionReceipt>("/contributions/submit", {
        method: "POST",
        body: JSON.stringify(input)
      })
  });
}
