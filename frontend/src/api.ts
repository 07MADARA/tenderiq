import { VerdictStatus, CriterionType } from './types';
import type { Tender, BidderEvaluation } from './types';

const MOCK_TENDERS: Tender[] = [
    {
        id: "TNDR-2026-CRPF-001",
        title: "Procurement of Surveillance Quadcopters (Advanced AI)",
        department: "Central Reserve Police Force (CRPF)",
        criteria: [
            { id: "C1", description: "Minimum annual turnover of ₹5 Crore in last 3 financial years.", type: CriterionType.FINANCIAL, is_mandatory: true },
            { id: "C2", description: "Must have completed at least 3 similar drone supply projects.", type: CriterionType.TECHNICAL, is_mandatory: true },
            { id: "C3", description: "ISO 9001:2015 Certification for quality management.", type: CriterionType.COMPLIANCE, is_mandatory: true },
            { id: "C4", description: "Make in India (MII) Class 1 Local Supplier Certificate.", type: CriterionType.DOCUMENT, is_mandatory: false },
        ]
    }
];

let MOCK_EVALUATIONS: Record<string, BidderEvaluation[]> = {
    "TNDR-2026-CRPF-001": [
        {
            bidder_id: "B001",
            bidder_name: "AeroDefense Systems Pvt Ltd",
            overall_status: VerdictStatus.ELIGIBLE,
            criterion_verdicts: [
                {
                    criterion_id: "C1",
                    status: VerdictStatus.ELIGIBLE,
                    explanation: "Found audited balance sheet indicating ₹7.5 Crore turnover for FY24-25.",
                    evidence: { criterion_id: "C1", extracted_value: "Turnover: ₹7.5 Cr", page_number: 12, document_snippet: "...Net Turnover of ₹7.5 Crore as verified by Auditor..." }
                },
                {
                    criterion_id: "C2",
                    status: VerdictStatus.ELIGIBLE,
                    explanation: "Submitted 4 completion certificates from BSF and ITBP.",
                    evidence: { criterion_id: "C2", extracted_value: "4 supply orders fulfilled", page_number: 25, document_snippet: "Project completion certificate: 150 quadcopters delivered." }
                },
                {
                    criterion_id: "C3",
                    status: VerdictStatus.ELIGIBLE,
                    explanation: "Valid ISO 9001:2015 certificate found, expiry 2028.",
                    evidence: { criterion_id: "C3", extracted_value: "ISO 9001:2015 valid till 2028", page_number: 50, document_snippet: "Certificate of Registration: ISO 9001:2015..." }
                }
            ]
        },
        {
            bidder_id: "B002",
            bidder_name: "SkyWatch Tech",
            overall_status: VerdictStatus.NEEDS_REVIEW,
            criterion_verdicts: [
                {
                    criterion_id: "C1",
                    status: VerdictStatus.NEEDS_REVIEW,
                    explanation: "Turnover certificate is a scanned photocopy with blurred digits. LLM confidence low (45%).",
                    evidence: { criterion_id: "C1", extracted_value: "Illegible", page_number: 8, document_snippet: "[BLURRED IMAGE TEXT]" }
                },
                {
                    criterion_id: "C2",
                    status: VerdictStatus.ELIGIBLE,
                    explanation: "Clear work orders found for 3 previous projects.",
                    evidence: { criterion_id: "C2", extracted_value: "3 Work Orders", page_number: 15, document_snippet: "Purchase Order #4492: Supply of surveillance drones." }
                },
                {
                    criterion_id: "C3",
                    status: VerdictStatus.ELIGIBLE,
                    explanation: "Valid ISO certificate found.",
                    evidence: { criterion_id: "C3", extracted_value: "ISO 9001:2015", page_number: 22, document_snippet: "Quality management system ISO..." }
                }
            ]
        },
        {
            bidder_id: "B003",
            bidder_name: "Global Trade Corp",
            overall_status: VerdictStatus.NOT_ELIGIBLE,
            criterion_verdicts: [
                {
                    criterion_id: "C1",
                    status: VerdictStatus.NOT_ELIGIBLE,
                    explanation: "Turnover is only ₹1.2 Crore, failing the ₹5 Crore requirement.",
                    evidence: { criterion_id: "C1", extracted_value: "Turnover: ₹1.2 Cr", page_number: 5, document_snippet: "Total annual revenue for the period was ₹1.2 Crore." }
                },
            ]
        }
    ]
};

export const api = {
  getTenders: async () => {
    return new Promise<Tender[]>((resolve) => setTimeout(() => resolve(MOCK_TENDERS), 500));
  },
  getTender: async (id: string) => {
    return new Promise<Tender>((resolve) => setTimeout(() => resolve(MOCK_TENDERS.find(t => t.id === id) as Tender), 200));
  },
  getEvaluations: async (tenderId: string) => {
    return new Promise<BidderEvaluation[]>((resolve) => setTimeout(() => resolve(MOCK_EVALUATIONS[tenderId] || []), 1000));
  },
  overrideVerdict: async (tenderId: string, bidderId: string, criterionId: string, status: VerdictStatus) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const evals = MOCK_EVALUATIONS[tenderId];
        if (evals) {
          const evalItem = evals.find(e => e.bidder_id === bidderId);
          if (evalItem) {
            const crit = evalItem.criterion_verdicts.find(c => c.criterion_id === criterionId);
            if (crit) {
              crit.status = status;
            }
            const hasNotEligible = evalItem.criterion_verdicts.some(c => c.status === VerdictStatus.NOT_ELIGIBLE);
            const hasNeedsReview = evalItem.criterion_verdicts.some(c => c.status === VerdictStatus.NEEDS_REVIEW);
            if (hasNotEligible) evalItem.overall_status = VerdictStatus.NOT_ELIGIBLE;
            else if (hasNeedsReview) evalItem.overall_status = VerdictStatus.NEEDS_REVIEW;
            else evalItem.overall_status = VerdictStatus.ELIGIBLE;
          }
        }
        resolve(true);
      }, 500);
    });
  }
};
