import bcrypt

def hash_password(password: str) ->str:
    """
    Create a hash for plaintext password.
    - Convert plaintext password to bytes (utf-8)
    - Generate salt
    - Generate hash
    - Return decoded hash (utf-8)
    """
    # bcrypt expects bytes
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify password matches hash.
    - Convert both password and hash to bytes (utf-8)
    - Check password against hash and return bool
    """
    password_bytes = password.encode("utf-8")
    password_hash_bytes = password_hash.encode("utf-8")
    return bcrypt.checkpw(password_bytes, password_hash_bytes)