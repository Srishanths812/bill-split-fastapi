import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import bcrypt
from dotenv import load_dotenv
import os
from bson.objectid import ObjectId
import uuid
import certifi

# Load environment variables
load_dotenv()


def hash_password(password: str) -> str:
    bytes_encoded=password.encode('utf-8')
    salt=bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(bytes_encoded,salt)


def verify_password(entered_password: str, hashed_password: str) -> bool:
    bytes_encoded=entered_password.encode("utf-8")
    return bcrypt.checkpw(bytes_encoded,hashed_password)

# MongoDB Connection
MONGO_URL = os.getenv("MONGO_URL")
try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
    client.admin.command('ping')
    db = client["CS_Project"]
    users_collection = db["users"]
    groups_collection = db["groups"]
    expenses_collection = db["expenses"]
    print("MongoDB connected successfully")
except ConnectionFailure as e:
    print("Failed to connect to MongoDB")
    print(e)
    db = None
    users_collection = None
    groups_collection = None
    expenses_collection = None

app = FastAPI()

origins=[
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    username: str
    password: str
    email: str = None

class FriendRequest(BaseModel):
    name: str
    myname: str

class SearchRequest(BaseModel):
    username: str

class ProfileDetailsRequest(BaseModel):
    username: str

class PasswordCheckRequest(BaseModel):
    username: str
    password: str

class DeleteAccountRequest(BaseModel):
    myname: str

class GroupDetailsRequest(BaseModel):
    username: str

class CreateGroupRequest(BaseModel):
    groupName: str
    amount: float
    members: List[str]

class AddExpenseRequest(BaseModel):
    groupId: str
    paidBy: str
    cost: float
    description: str
    splits: List[dict]

class AddGroupMemberRequest(BaseModel):
    groupId: str
    username: str

@app.get("/health")
def read_root():
    return {
        "status": "Backend Server Running",
        "database": "connected" if db else "disconnected"
    }

@app.post("/login")
async def login(credentials: LoginRequest):
    """Login endpoint"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    user = users_collection.find_one({"username": credentials.username})
    
    if not user:
        return {"success": False, "message": "Invalid username or password"}
    
    if not verify_password(credentials.password, user.get("password")):
        return {"success": False, "message": "Invalid username or password"}
    
    return {
        "message": "Login successful",
        "success": True,
        "token": "authenticated",
        "username": user.get("username")
    }

@app.post("/signup")
async def signup(credentials: SignupRequest):
    """Signup endpoint - Register new user"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    existing_user = users_collection.find_one({"username": credentials.username})
    
    if existing_user:
        return {"success": False, "message": "Username already exists"}
    
    hashed_password = hash_password(credentials.password)
    
    new_user = {
        "username": credentials.username,
        "password": hashed_password,
        "email": credentials.email,
        "dp": ["https://static.thenounproject.com/png/65090-200.png"],
        "friends": [],
        "friend_requests": []
    }
    
    result = users_collection.insert_one(new_user)
    
    return {
        "message": "Account created successfully",
        "success": True,
        "token": "authenticated",
        "username": credentials.username
    }

@app.get("/main")
async def main_page_auth():
    """Get main page authorization check"""
    return {"success": True, "message": "Authorized"}

@app.post("/profile_details")
async def get_profile_details(request: ProfileDetailsRequest):
    """Get user profile details"""
    try:
        if users_collection is None:
            return {"success": False, "message": "Database connection failed"}
        
        user = users_collection.find_one({"username": request.username})
        
        if not user:
            return {"success": False, "message": "User not found"}
        
        return {
            "success": True,
            "username": user.get("username"),
            "email": user.get("email"),
            "dp": user.get("dp", ["https://static.thenounproject.com/png/65090-200.png"])
        }
    except Exception as e:
        print(f"Error in get_profile_details: {str(e)}")
        return {"success": False, "message": f"Error: {str(e)}"}

@app.post("/passwordcheck")
async def check_password(request: PasswordCheckRequest):
    """Check if password is correct"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    user = users_collection.find_one({"username": request.username})
    
    if not user:
        return {"success": False, "message": "User not found"}
    
    if verify_password(request.password, user.get("password")):
        return {"success": True, "message": "Password correct"}
    
    return {"success": False, "message": "Password incorrect"}

class UpdateProfileRequest(BaseModel):
    username: str
    newusername: str
    password: Optional[str] = None

@app.post("/update_profile_details")
async def update_profile_details(
    request: UpdateProfileRequest,
    dp: Optional[UploadFile] = File(None)
):
    """Update user profile details"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    user = users_collection.find_one({"username": request.username})
    
    if not user:
        return {"success": False, "message": "User not found"}
    
    # Check if new username already exists
    if request.newusername != request.username:
        existing = users_collection.find_one({"username": request.newusername})
        if existing:
            return {"success": False, "message": "Username already exists"}
    
    update_data = {"username": request.newusername}
    
    if request.password:
        update_data["password"] = hash_password(request.password)
    
    if dp:
        # In production, save file to storage service
        # For now, we'll just store the filename
        update_data["dp"] = [f"dp_{uuid.uuid4()}_{dp.filename}"]
    
    users_collection.update_one({"username": request.username}, {"$set": update_data})
    
    return {"success": True, "message": "Profile updated successfully"}

@app.post("/delete")
async def delete_account(request: DeleteAccountRequest):
    """Delete user account"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    result = users_collection.delete_one({"username": request.myname})
    
    if result.deleted_count > 0:
        return {"success": True, "message": "Account deleted successfully"}
    
    return {"success": False, "message": "Account deletion failed"}

@app.post("/search")
async def search_users(request: SearchRequest):
    """Search for users by username"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    search_pattern = {"username": {"$regex": f".*{request.username}.*", "$options": "i"}}
    users = users_collection.find(search_pattern)
    
    usernames = [user.get("username") for user in users]
    
    return usernames

@app.post("/friend")
async def get_pending_friend_requests(request: ProfileDetailsRequest):
    """Get pending friend requests for a user"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    user = users_collection.find_one({"username": request.username})
    
    if not user:
        return []
    
    return user.get("friend_requests", [])

@app.post("/addfriend")
async def add_friend(request: FriendRequest):
    """Send friend request"""
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    sender = users_collection.find_one({"username": request.myname})
    receiver = users_collection.find_one({"username": request.name})
    
    if not receiver:
        return {"success": False, "message": "User not found"}
    
    # Check if already friends
    if request.name in sender.get("friends", []):
        return {"success": False, "message": "User is already your friend"}
    
    # Add to friend requests
    if request.name not in receiver.get("friend_requests", []):
        users_collection.update_one(
            {"username": request.name},
            {"$push": {"friend_requests": request.myname}}
        )
    
    return {"success": True, "message": "Friend request sent"}

@app.post("/acceptfriend")
async def accept_friend_request(request: FriendRequest):
    """Accept friend request"""
    if not users_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    # Add both users to each other's friends list
    users_collection.update_one(
        {"username": request.myname},
        {"$push": {"friends": request.name}, "$pull": {"friend_requests": request.name}}
    )
    
    users_collection.update_one(
        {"username": request.name},
        {"$push": {"friends": request.myname}}
    )
    
    return {"success": True, "message": "Friend request accepted"}

@app.post("/deletefriendinv")
async def decline_friend_request(request: FriendRequest):
    """Decline/delete friend request"""
    if not users_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    users_collection.update_one(
        {"username": request.myname},
        {"$pull": {"friend_requests": request.name}}
    )
    
    return {"success": True, "message": "Friend request declined"}

@app.post("/friendlist")
async def get_friends_list(request: ProfileDetailsRequest):
    """Get list of friends for a user"""
    if not users_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    user = users_collection.find_one({"username": request.username})
    
    if not user:
        return []
    
    return user.get("friends", [])

@app.post("/deletefriend")
async def delete_friend(request: FriendRequest):
    """Remove a friend"""
    if not users_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    users_collection.update_one(
        {"username": request.myname},
        {"$pull": {"friends": request.name}}
    )
    
    users_collection.update_one(
        {"username": request.name},
        {"$pull": {"friends": request.myname}}
    )
    
    return {"success": True, "message": "Friend removed"}

@app.post("/main_page_group_details")
async def get_main_page_group_details(request: GroupDetailsRequest):
    """Get group details for main page"""
    if not groups_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    groups = groups_collection.find({"members": request.username})
    
    result = []
    for group in groups:
        expenses = expenses_collection.find({"groupId": str(group.get("_id"))})
        expenses_list = []
        for exp in expenses:
            expenses_list.append({
                "paidBy": exp.get("paidBy"),
                "cost": exp.get("cost"),
                "splits": exp.get("splits", [])
            })
        
        result.append({
            "groupId": str(group.get("_id")),
            "groupName": group.get("groupName"),
            "amount": group.get("amount", 0),
            "expenses": expenses_list
        })
    
    return result


@app.post("/create_group")
async def create_group(request: CreateGroupRequest):
    """Create a new group"""
    if not groups_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    group = {
        "groupName": request.groupName,
        "amount": request.amount,
        "members": request.members,
        "createdAt": None
    }
    
    result = groups_collection.insert_one(group)
    
    return {
        "success": True,
        "message": "Group created successfully",
        "groupId": str(result.inserted_id)
    }

@app.post("/add_expense")
async def add_expense(request: AddExpenseRequest):
    """Add expense to group"""
    if not expenses_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    expense = {
        "groupId": request.groupId,
        "paidBy": request.paidBy,
        "cost": request.cost,
        "description": request.description,
        "splits": request.splits
    }
    
    result = expenses_collection.insert_one(expense)
    
    return {
        "success": True,
        "message": "Expense added successfully",
        "expenseId": str(result.inserted_id)
    }

@app.get("/group/{groupId}")
async def get_group_info(groupId: str):
    """Get group information"""
    if not groups_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        group = groups_collection.find_one({"_id": ObjectId(groupId)})
        if not group:
            return {"success": False, "message": "Group not found"}
        
        return {
            "success": True,
            "groupId": str(group.get("_id")),
            "groupName": group.get("groupName"),
            "amount": group.get("amount"),
            "members": group.get("members", [])
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get("/group/{groupId}/expenses")
async def get_group_expenses(groupId: str):
    """Get expenses for a group"""
    if not expenses_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    expenses = expenses_collection.find({"groupId": groupId})
    
    result = []
    for exp in expenses:
        result.append({
            "expenseId": str(exp.get("_id")),
            "paidBy": exp.get("paidBy"),
            "cost": exp.get("cost"),
            "description": exp.get("description"),
            "splits": exp.get("splits", [])
        })
    
    return result

@app.post("/add_group_member")
async def add_group_member(request: AddGroupMemberRequest):
    """Add member to group"""
    if not groups_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        groups_collection.update_one(
            {"_id": ObjectId(request.groupId)},
            {"$push": {"members": request.username}}
        )
        
        return {"success": True, "message": "Member added successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/group_all_details")
async def get_group_all_details(request: AddExpenseRequest):
    """Get all details of a group"""
    if not groups_collection or not expenses_collection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        group = groups_collection.find_one({"_id": ObjectId(request.groupId)})
        if not group:
            return {"success": False, "message": "Group not found"}
        
        expenses = expenses_collection.find({"groupId": request.groupId})
        expenses_list = []
        
        for exp in expenses:
            expenses_list.append({
                "expenseId": str(exp.get("_id")),
                "paidBy": exp.get("paidBy"),
                "cost": exp.get("cost"),
                "description": exp.get("description"),
                "splits": exp.get("splits", [])
            })
        
        return {
            "success": True,
            "groupId": str(group.get("_id")),
            "groupName": group.get("groupName"),
            "amount": group.get("amount"),
            "members": group.get("members", []),
            "expenses": expenses_list
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    print("\n" + "="*50)
    print("Starting FastAPI Backend Server...")
    print("Server running at: http://localhost:8000")
    print("API Docs at: http://localhost:8000/docs")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

