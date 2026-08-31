from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Store the user's latest generated learning path
    learning_path = relationship("LearningPath", back_populates="owner", uselist=False)

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    recommended_career = Column(String)
    path_data = Column(JSON) # Store the array of courses
    explanation = Column(Text)
    
    owner = relationship("User", back_populates="learning_path")
