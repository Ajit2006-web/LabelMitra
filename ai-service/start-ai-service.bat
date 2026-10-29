
@echo off
cd /d D:\LabelMitra\ai-service
call .venv\Scripts\activate.bat
python -m uvicorn app:app --host 127.0.0.1 --port 8000
pause
@REM .\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000