from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import Tender, Criterion, CriterionType, BidderEvaluation, CriterionVerdict, VerdictStatus, Evidence
import asyncio

app = FastAPI(title="TenderIQ API", description="API for TenderIQ AI Evaluation Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data
MOCK_TENDERS = [
    Tender(
        id="TNDR-2026-CRPF-001",
        title="Procurement of Surveillance Quadcopters (Advanced AI)",
        department="Central Reserve Police Force (CRPF)",
        criteria=[
            Criterion(id="C1", description="Minimum annual turnover of ₹5 Crore in last 3 financial years.", type=CriterionType.FINANCIAL, is_mandatory=True),
            Criterion(id="C2", description="Must have completed at least 3 similar drone supply projects.", type=CriterionType.TECHNICAL, is_mandatory=True),
            Criterion(id="C3", description="ISO 9001:2015 Certification for quality management.", type=CriterionType.COMPLIANCE, is_mandatory=True),
            Criterion(id="C4", description="Make in India (MII) Class 1 Local Supplier Certificate.", type=CriterionType.DOCUMENT, is_mandatory=False),
        ]
    )
]

MOCK_EVALUATIONS = {
    "TNDR-2026-CRPF-001": [
        BidderEvaluation(
            bidder_id="B001",
            bidder_name="AeroDefense Systems Pvt Ltd",
            overall_status=VerdictStatus.ELIGIBLE,
            criterion_verdicts=[
                CriterionVerdict(
                    criterion_id="C1",
                    status=VerdictStatus.ELIGIBLE,
                    explanation="Found audited balance sheet indicating ₹7.5 Crore turnover for FY24-25.",
                    evidence=Evidence(criterion_id="C1", extracted_value="Turnover: ₹7.5 Cr", page_number=12, document_snippet="...Net Turnover of ₹7.5 Crore as verified by Auditor...")
                ),
                CriterionVerdict(
                    criterion_id="C2",
                    status=VerdictStatus.ELIGIBLE,
                    explanation="Submitted 4 completion certificates from BSF and ITBP.",
                    evidence=Evidence(criterion_id="C2", extracted_value="4 supply orders fulfilled", page_number=25, document_snippet="Project completion certificate: 150 quadcopters delivered.")
                ),
                CriterionVerdict(
                    criterion_id="C3",
                    status=VerdictStatus.ELIGIBLE,
                    explanation="Valid ISO 9001:2015 certificate found, expiry 2028.",
                    evidence=Evidence(criterion_id="C3", extracted_value="ISO 9001:2015 valid till 2028", page_number=50, document_snippet="Certificate of Registration: ISO 9001:2015...")
                )
            ]
        ),
        BidderEvaluation(
            bidder_id="B002",
            bidder_name="SkyWatch Tech",
            overall_status=VerdictStatus.NEEDS_REVIEW,
            criterion_verdicts=[
                CriterionVerdict(
                    criterion_id="C1",
                    status=VerdictStatus.NEEDS_REVIEW,
                    explanation="Turnover certificate is a scanned photocopy with blurred digits. LLM confidence low (45%).",
                    evidence=Evidence(criterion_id="C1", extracted_value="Illegible", page_number=8, document_snippet="[BLURRED IMAGE TEXT]")
                ),
                CriterionVerdict(
                    criterion_id="C2",
                    status=VerdictStatus.ELIGIBLE,
                    explanation="Clear work orders found for 3 previous projects.",
                    evidence=Evidence(criterion_id="C2", extracted_value="3 Work Orders", page_number=15, document_snippet="Purchase Order #4492: Supply of surveillance drones.")
                ),
                CriterionVerdict(
                    criterion_id="C3",
                    status=VerdictStatus.ELIGIBLE,
                    explanation="Valid ISO certificate found.",
                    evidence=Evidence(criterion_id="C3", extracted_value="ISO 9001:2015", page_number=22, document_snippet="Quality management system ISO...")
                )
            ]
        ),
        BidderEvaluation(
            bidder_id="B003",
            bidder_name="Global Trade Corp",
            overall_status=VerdictStatus.NOT_ELIGIBLE,
            criterion_verdicts=[
                CriterionVerdict(
                    criterion_id="C1",
                    status=VerdictStatus.NOT_ELIGIBLE,
                    explanation="Turnover is only ₹1.2 Crore, failing the ₹5 Crore requirement.",
                    evidence=Evidence(criterion_id="C1", extracted_value="Turnover: ₹1.2 Cr", page_number=5, document_snippet="Total annual revenue for the period was ₹1.2 Crore.")
                ),
            ]
        )
    ]
}

@app.get("/api/tenders", response_model=List[Tender])
async def get_tenders():
    # Simulate DB fetch
    await asyncio.sleep(0.5)
    return MOCK_TENDERS

@app.get("/api/tenders/{tender_id}", response_model=Tender)
async def get_tender(tender_id: str):
    tender = next((t for t in MOCK_TENDERS if t.id == tender_id), None)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@app.get("/api/tenders/{tender_id}/evaluations", response_model=List[BidderEvaluation])
async def get_evaluations(tender_id: str):
    # Simulate AI processing time briefly to show a spinner on frontend
    await asyncio.sleep(1.5)
    evals = MOCK_EVALUATIONS.get(tender_id)
    if not evals:
        return []
    return evals

@app.post("/api/tenders/{tender_id}/evaluations/{bidder_id}/override")
async def override_verdict(tender_id: str, bidder_id: str, payload: dict):
    # Mocking endpoint for human-in-the-loop override
    new_status = payload.get("status")
    criterion_id = payload.get("criterion_id")
    
    if tender_id in MOCK_EVALUATIONS:
        for eval in MOCK_EVALUATIONS[tender_id]:
            if eval.bidder_id == bidder_id:
                for crit in eval.criterion_verdicts:
                    if crit.criterion_id == criterion_id:
                        crit.status = new_status
                # Re-evaluate overall status
                has_not_eligible = any(c.status == VerdictStatus.NOT_ELIGIBLE for c in eval.criterion_verdicts)
                has_needs_review = any(c.status == VerdictStatus.NEEDS_REVIEW for c in eval.criterion_verdicts)
                
                if has_not_eligible:
                    eval.overall_status = VerdictStatus.NOT_ELIGIBLE
                elif has_needs_review:
                    eval.overall_status = VerdictStatus.NEEDS_REVIEW
                else:
                    eval.overall_status = VerdictStatus.ELIGIBLE
                return {"message": "Verdict overridden successfully", "evaluation": eval}
    
    raise HTTPException(status_code=404, detail="Evaluation not found")
