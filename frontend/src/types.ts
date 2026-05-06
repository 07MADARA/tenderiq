export enum CriterionType {
  TECHNICAL = "technical",
  FINANCIAL = "financial",
  COMPLIANCE = "compliance",
  DOCUMENT = "document"
}

export interface Criterion {
  id: string;
  description: string;
  type: CriterionType;
  is_mandatory: boolean;
}

export interface Tender {
  id: string;
  title: string;
  department: string;
  criteria: Criterion[];
}

export interface Evidence {
  criterion_id: string;
  extracted_value: string;
  page_number: number;
  bounding_box?: string;
  document_snippet: string;
}

export enum VerdictStatus {
  ELIGIBLE = "eligible",
  NOT_ELIGIBLE = "not_eligible",
  NEEDS_REVIEW = "needs_review"
}

export interface CriterionVerdict {
  criterion_id: string;
  status: VerdictStatus;
  explanation: string;
  evidence?: Evidence;
}

export interface BidderEvaluation {
  bidder_id: string;
  bidder_name: string;
  overall_status: VerdictStatus;
  criterion_verdicts: CriterionVerdict[];
}
