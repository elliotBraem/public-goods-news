import { createFileRoute } from "@tanstack/react-router";
import SubmissionList from "../components/SubmissionList";

export const Route = createFileRoute("/")({
  component: SubmissionList,
});
