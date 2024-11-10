# foodie-safety-app

- Ensure Python 3.13.0 is installed before cloning the repo

# Local environment setup

1. Navigate to backend directory

```
cd backend
```

2. Create a virtual environment

```
python3 -m venv .venv
```

3. Activate the virtual environment
   macOS/Linux

```
source .venv/bin/activate
```

Windows

```
.\.venv\Scripts\activate
```

4. Install dependencies

```
pip install -r requirements.txt
```

5. Update requirements.txt if new packages are added

```
pip freeze > requirements.txt
```

# Deactivate .venv when done

```
deactivate
```

# FastAPI Tryout

Run the following command and start the server locally

```
uvicorn main:app --reload
```

# Auto documentation
UI_ver1
```
<local url with port 8000>/docs
```

UI_ver2
```
<local url with port 8000>/redoc
```