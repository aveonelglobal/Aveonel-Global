from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'aveonel-global-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Aveonel Global API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class PipelineStage(str, Enum):
    NEW_LEAD = "new_lead"
    CONTACTED = "contacted"
    ONBOARDING = "onboarding"
    ACTIVE_PILOT = "active_pilot"
    COMPLETED = "completed"

class RevenueRange(str, Enum):
    UNDER_3K = "under_3k"
    THREE_TO_5K = "3k_to_5k"
    FIVE_TO_10K = "5k_to_10k"
    OVER_10K = "over_10k"

# Models
class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    business_type: str
    revenue_range: RevenueRange
    consultation_date: Optional[str] = None
    pilot_start_date: Optional[str] = None
    pipeline_stage: PipelineStage = PipelineStage.NEW_LEAD
    notes: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    business_type: str
    revenue_range: RevenueRange
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    business_type: Optional[str] = None
    revenue_range: Optional[RevenueRange] = None
    consultation_date: Optional[str] = None
    pilot_start_date: Optional[str] = None
    pipeline_stage: Optional[PipelineStage] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None

class PilotApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    business_type: str
    revenue_range: RevenueRange
    biggest_challenge: str
    ontario_based: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PilotApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    business_type: str
    revenue_range: RevenueRange
    biggest_challenge: str
    ontario_based: bool = True

class DashboardStats(BaseModel):
    total_leads: int
    new_leads: int
    contacted: int
    onboarding: int
    active_pilots: int
    completed: int
    pilot_spots_remaining: int

# Auth helpers
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.admin_users.find_one({"email": email}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Public routes
@api_router.get("/")
async def root():
    return {"message": "Aveonel Global API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "aveonel-global-api"}

# Auth routes
@api_router.post("/auth/register", response_model=Token)
async def register(data: AdminRegister):
    existing = await db.admin_users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = AdminUser(
        email=data.email,
        password_hash=get_password_hash(data.password),
        name=data.name
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admin_users.insert_one(doc)
    
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token)

@api_router.post("/auth/login", response_model=Token)
async def login(data: AdminLogin):
    user = await db.admin_users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return Token(access_token=access_token)

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"]
    }

# Pilot Application (Public)
@api_router.post("/pilot/apply", response_model=dict)
async def submit_pilot_application(data: PilotApplicationCreate):
    if not data.ontario_based:
        raise HTTPException(
            status_code=400, 
            detail="Currently, we only accept applications from Ontario-based coaches and consultants."
        )
    
    # Check if email already applied
    existing = await db.pilot_applications.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted an application")
    
    # Check pilot spots
    active_count = await db.clients.count_documents({
        "pipeline_stage": {"$in": ["onboarding", "active_pilot"]}
    })
    if active_count >= 10:
        raise HTTPException(status_code=400, detail="All pilot spots are currently filled. Please check back later.")
    
    application = PilotApplication(**data.model_dump())
    doc = application.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.pilot_applications.insert_one(doc)
    
    # Create client record
    client = Client(
        name=data.name,
        email=data.email,
        phone=data.phone,
        business_type=data.business_type,
        revenue_range=data.revenue_range,
        notes=f"Biggest challenge: {data.biggest_challenge}",
        pipeline_stage=PipelineStage.NEW_LEAD
    )
    client_doc = client.model_dump()
    client_doc['created_at'] = client_doc['created_at'].isoformat()
    client_doc['updated_at'] = client_doc['updated_at'].isoformat()
    await db.clients.insert_one(client_doc)
    
    return {
        "success": True,
        "message": "Your application has been submitted successfully! We'll be in touch within 24-48 hours.",
        "application_id": application.id
    }

# Client CRUD (Protected)
@api_router.get("/clients", response_model=List[Client])
async def get_clients(
    stage: Optional[PipelineStage] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if stage:
        query["pipeline_stage"] = stage.value
    
    clients = await db.clients.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for client in clients:
        if isinstance(client.get('created_at'), str):
            client['created_at'] = datetime.fromisoformat(client['created_at'])
        if isinstance(client.get('updated_at'), str):
            client['updated_at'] = datetime.fromisoformat(client['updated_at'])
    
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: dict = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if isinstance(client.get('created_at'), str):
        client['created_at'] = datetime.fromisoformat(client['created_at'])
    if isinstance(client.get('updated_at'), str):
        client['updated_at'] = datetime.fromisoformat(client['updated_at'])
    
    return client

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(
    client_id: str, 
    data: ClientUpdate,
    current_user: dict = Depends(get_current_user)
):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.clients.update_one({"id": client_id}, {"$set": update_data})
    
    updated_client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if isinstance(updated_client.get('created_at'), str):
        updated_client['created_at'] = datetime.fromisoformat(updated_client['created_at'])
    if isinstance(updated_client.get('updated_at'), str):
        updated_client['updated_at'] = datetime.fromisoformat(updated_client['updated_at'])
    
    return updated_client

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"success": True, "message": "Client deleted"}

# Dashboard Stats
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    total = await db.clients.count_documents({})
    new_leads = await db.clients.count_documents({"pipeline_stage": "new_lead"})
    contacted = await db.clients.count_documents({"pipeline_stage": "contacted"})
    onboarding = await db.clients.count_documents({"pipeline_stage": "onboarding"})
    active_pilots = await db.clients.count_documents({"pipeline_stage": "active_pilot"})
    completed = await db.clients.count_documents({"pipeline_stage": "completed"})
    
    pilot_spots_remaining = max(0, 10 - (onboarding + active_pilots))
    
    return DashboardStats(
        total_leads=total,
        new_leads=new_leads,
        contacted=contacted,
        onboarding=onboarding,
        active_pilots=active_pilots,
        completed=completed,
        pilot_spots_remaining=pilot_spots_remaining
    )

# Export to CSV
@api_router.get("/clients/export/csv")
async def export_clients_csv(current_user: dict = Depends(get_current_user)):
    clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    
    if not clients:
        return {"csv": "No clients found"}
    
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "id", "name", "email", "phone", "business_type", "revenue_range",
        "consultation_date", "pilot_start_date", "pipeline_stage", "notes",
        "tags", "created_at", "updated_at"
    ])
    writer.writeheader()
    
    for client in clients:
        client['tags'] = ','.join(client.get('tags', []))
        writer.writerow(client)
    
    return {"csv": output.getvalue()}

# Calendly Webhook (placeholder for future integration)
@api_router.post("/webhooks/calendly")
async def calendly_webhook(payload: dict):
    logging.info(f"Received Calendly webhook: {payload}")
    # TODO: Process Calendly booking events
    return {"status": "received"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
