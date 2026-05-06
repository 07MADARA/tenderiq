from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class CriterionType(str, Enum):
    TECHNICAL = "technical"
    FINANCIAL = "financial"
    COMPLIANCE = "compliance"
    DOCUMENT = "document"

class Criterion(BaseModel):
    id: str
    description: str
    type: CriterionType
    is_mandatory: bool

class Tender(BaseModel):
    id: str
    title: str
    department: str
    criteria: List[Criterion]

class Evidence(BaseModel):
    criterion_id: str
    extracted_value: str
    page_number: int
    bounding_box: Optional[str] = None
    document_snippet: str

class VerdictStatus(str, Enum):
    ELIGIBLE = "eligible"
    NOT_ELIGIBLE = "not_eligible"
    NEEDS_REVIEW = "needs_review"

class CriterionVerdict(BaseModel):
    criterion_id: str
    status: VerdictStatus
    explanation: str
    evidence: Optional[Evidence] = None

class BidderEvaluation(BaseModel):
    bidder_id: str
    bidder_name: str
    overall_status: VerdictStatus
    criterion_verdicts: List[CriterionVerdict]
