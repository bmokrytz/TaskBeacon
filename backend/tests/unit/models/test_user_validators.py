from datetime import datetime, timezone, timedelta
import uuid

import pytest
from pydantic import ValidationError

from app.models.user import User, UserCreate, UserPublic
from app.auth.security import hash_password, verify_password

test_email = "user@example.com"
test_password = "Password123@"
test_password_hash = hash_password(test_password)
test_current_time = datetime.now(timezone.utc)
test_id = uuid.uuid4()

class TestUserPublic:
    def test_uuid_id_value_is_accepted(self):
        user_public = UserPublic(id=test_id, email=test_email, created_at=test_current_time)
        
        assert user_public.id == test_id
            
    def test_no_id_value_is_rejected(self):
        with pytest.raises(ValidationError):
            UserPublic(email=test_email, created_at=test_current_time)
        
    def test_non_uuid_id_value_is_rejected(self):
        with pytest.raises(ValidationError):
            UserPublic(id="not a uuid", email=test_email, created_at=test_current_time)
    
    @pytest.mark.parametrize("length", [1, 120])
    def test_email_within_length_limit_is_accepted(self, length):
        email = "e" * length
        user_public = UserPublic(id=test_id, email=email, created_at=test_current_time)
        
        assert user_public.email == email
    
    def test_email_exceeding_length_limit_is_rejected(self):
        email = "e" * 121
        
        with pytest.raises(ValidationError):
            UserPublic(id=test_id, email=email, created_at=test_current_time)
    
    def test_email_is_normalized_to_lowercase(self):
        user_public = UserPublic(id=test_id, email="USeR@examPLe.com", created_at=test_current_time)
        
        assert user_public.email == "user@example.com"
    
    @pytest.mark.parametrize("email", ["", "         "])
    def test_empty_email_is_rejected(self, email):
        with pytest.raises(ValidationError) as excinfo:
            UserPublic(id=test_id, email=email, created_at=test_current_time)
        
        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("email",)
        if email:
            assert str(error["ctx"]["error"]) == "email cannot be empty"   
    
    def test_email_whitespace_gets_stripped(self):
        user_public = UserPublic(id=test_id, email="       user@example.com          ", created_at=test_current_time)

        assert user_public.email == "user@example.com"
    
    def test_no_created_at_value_is_rejected(self):
        with pytest.raises(ValidationError):
            UserPublic(id=test_id, email=test_email)
    
    @pytest.mark.parametrize("creation_date", [datetime.now() - timedelta(days=3), datetime.now() + timedelta(days=3)])
    def test_past_and_future_created_at_dates_are_accepted(self, creation_date):
        user_public = UserPublic(id=test_id, email=test_email, created_at=creation_date)
        
        assert user_public.created_at == creation_date
    

class TestUserCreate:
    @pytest.mark.parametrize("length", [1, 120])    
    def test_email_within_length_limits_is_accepted(self, length):
        email = "e" * length
        user_public = UserCreate(email=email, password=test_password)
        
        assert user_public.email == email
    
    def test_email_exceeding_length_limit_is_rejected(self):
        email = "e" * 121
        
        with pytest.raises(ValidationError):
            UserCreate(email=email, password=test_password)
    
    @pytest.mark.parametrize("email", ["", "        "])
    def test_empty_email_is_rejected(self, email):
        with pytest.raises(ValidationError) as excinfo:
            UserCreate(email=email, password=test_password)
        
        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("email",)
        if email:
            assert str(error["ctx"]["error"]) == "email cannot be empty"
        
    def test_email_is_normalized_to_lowercase(self):
        user_create = UserCreate(email="USER@exAMplE.com", password=test_password)
        
        assert user_create.email == "user@example.com"
        
    def test_email_whitespace_gets_stripped(self):
        user_create = UserCreate(email="          user@example.com            ", password=test_password)
                
        assert user_create.email == "user@example.com"
    
    @pytest.mark.parametrize("length", [8, 72])
    def test_password_within_length_limits_is_accepted(self, length):
        password = "e" * length
        password_hash = hash_password(password)
        assert verify_password(password, password_hash)
        user_create = UserCreate(email=test_email, password=password)
                        
        assert user_create.password == password
    
    def test_no_password_value_is_rejected(self):
        with pytest.raises(ValidationError):
            UserCreate(email=test_email)
    
    @pytest.mark.parametrize("password", ["", "         "])
    def test_empty_password_is_rejected(self, password):
        with pytest.raises(ValidationError) as excinfo:
            UserCreate(email=test_email, password=password)

        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("password",)
        if password:
            assert str(error["ctx"]["error"]) == "password cannot be empty"
            
    def test_password_whitespace_gets_stripped(self):
        user_create = UserCreate(email=test_email, password="    Password123@       ")
                                
        assert user_create.password == "Password123@"


class TestUser:
    def test_uuid_id_value_is_accepted(self):
        user = User(id=test_id, email=test_email, password_hash=test_password_hash, created_at=test_current_time)
        
        assert user.id == test_id
    
    def test_non_uuid_id_value_is_rejected(self):
        with pytest.raises(ValidationError):
            User(id="not a uuid", email=test_email, password_hash=test_password_hash, created_at=test_current_time)
    
    def test_no_id_value_is_rejected(self):
        with pytest.raises(ValidationError):
            User(email=test_email, password_hash=test_password_hash, created_at=test_current_time)
    
    @pytest.mark.parametrize("length", [1, 120])
    def test_email_within_length_limits_is_accepted(self, length):
        email = "e" * length
        user = User(id=test_id, email=email, password_hash=test_password_hash, created_at=test_current_time)
        
        assert user.email == email
    
    def test_no_email_value_is_rejected(self):
        with pytest.raises(ValidationError):
            User(id=test_id, password_hash=test_password_hash, created_at=test_current_time)
    
    @pytest.mark.parametrize("email", ["", "       "])
    def test_empty_email_is_rejected(self, email):
        with pytest.raises(ValidationError) as excinfo:
            User(id=test_id, email=email, password_hash=test_password_hash, created_at=test_current_time)
        
        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("email",)
        if email:
            assert str(error["ctx"]["error"]) == "email cannot be empty"
    
    def test_no_password_hash_value_is_rejected(self):
        with pytest.raises(ValidationError):
            User(id=test_id, email=test_email, created_at=test_current_time)
    
    def test_password_hash_within_length_limit_is_accepted(self):
        password_hash = "e" * 255
        user = User(id=test_id, email=test_email, password_hash=password_hash, created_at=test_current_time)
        
        assert user.password_hash == password_hash
    
    def test_password_hash_exceeding_length_limit_is_rejected(self):
        password_hash = "e" * 256
        
        with pytest.raises(ValidationError):
            User(id=test_id, email=test_email, password_hash=password_hash, created_at=test_current_time)
    
    def test_no_created_at_value_is_rejected(self):
        with pytest.raises(ValidationError):
            User(id=test_id, email=test_email, password_hash=test_password_hash)
    
    @pytest.mark.parametrize("creation_date", [datetime.now(timezone.utc) - timedelta(days=3), datetime.now(timezone.utc) + timedelta(days=3)])
    def test_past_and_future_created_at_times_are_accepted(self, creation_date):
        user = User(id=test_id, email=test_email, password_hash=test_password_hash, created_at=creation_date)
                
        assert user.created_at == creation_date
